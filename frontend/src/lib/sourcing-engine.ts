/**
 * Autonomous Sourcing Engine
 *
 * Orchestrates the sourcing pipeline:
 * 1. Parse natural language query into structured intent
 * 2. Select appropriate sources based on intent
 * 3. Dispatch queries to sources in parallel
 * 4. Normalize results
 * 5. Enrich with AI scoring
 * 6. Rank and return results
 */

import type {
  SourcingIntent,
  SourcingQuery,
  SourcingJob,
  RawSourcingResult,
  NormalizedCandidate,
  EnrichedCandidate,
  IntentParseResult,
  SourceType,
  SourcingFilters,
} from "@/types/sourcing";
import { getConnector, getEnabledSources } from "./sources";
import { normalizeCandidate, deduplicateCandidates } from "./normalization";
import { enrichCandidate } from "./enrichment";

/**
 * Parse a natural language sourcing query into structured intent
 */
export function parseSourcingIntent(query: string): IntentParseResult {
  const lower = query.toLowerCase();
  const intent: SourcingIntent = {
    rawQuery: query,
    skills: [],
    seniority: "any",
    titleKeywords: [],
    companyKeywords: [],
    excludeKeywords: [],
  };

  // Extract skills
  const skillPatterns = [
    /\b(javascript|typescript|python|java|go|golang|rust|c\+\+|c#|ruby|php|swift|kotlin|scala|sql|react|angular|vue|node|django|flask|spring|rails|docker|kubernetes|aws|gcp|azure|terraform|ansible|ml|machine learning|deep learning|nlp|ai|artificial intelligence|data science|devops|sre|blockchain|web3|solidity)\b/gi,
  ];

  for (const pattern of skillPatterns) {
    const matches = lower.match(pattern);
    if (matches) {
      intent.skills.push(
        ...matches.map((m) => m.charAt(0).toUpperCase() + m.slice(1))
      );
    }
  }

  // Extract seniority
  if (/\b(senior|sr\.?|staff|principal)\b/.test(lower)) {
    intent.seniority = "senior";
  } else if (/\b(lead|tech lead|team lead|engineering lead)\b/.test(lower)) {
    intent.seniority = "lead";
  } else if (/\b(junior|jr\.?|entry|intern|graduate)\b/.test(lower)) {
    intent.seniority = "junior";
  } else if (/\b(mid|mid-level|intermediate)\b/.test(lower)) {
    intent.seniority = "mid";
  }

  // Extract location
  const locationPatterns = [
    /\bin\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
    /\b(bangalore|bengaluru|mumbai|delhi|hyderabad|chennai|pune|san francisco|new york|london|berlin|toronto|singapore|tokyo|sydney|remote)\b/i,
  ];

  for (const pattern of locationPatterns) {
    const match = query.match(pattern);
    if (match) {
      intent.location = match[1] || match[0];
      break;
    }
  }

  // Extract industry
  const industryKeywords = [
    "banking", "fintech", "finance", "healthcare", "saas", "e-commerce",
    "ecommerce", "gaming", "crypto", "blockchain", "insurance", "retail",
    "telecom", "education", "edtech", "media", "automotive", "manufacturing",
  ];

  for (const keyword of industryKeywords) {
    if (lower.includes(keyword)) {
      intent.industry = keyword.charAt(0).toUpperCase() + keyword.slice(1);
      break;
    }
  }

  // Extract title keywords
  const titlePatterns = [
    /\b(architect|engineer|developer|manager|designer|analyst|scientist|consultant|director|vp|cto|ceo|founder)\b/gi,
  ];

  for (const pattern of titlePatterns) {
    const matches = lower.match(pattern);
    if (matches) {
      intent.titleKeywords.push(
        ...matches.map((m) => m.charAt(0).toUpperCase() + m.slice(1))
      );
    }
  }

  // Extract experience range
  const expMatch = lower.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)?/);
  if (expMatch) {
    const years = parseInt(expMatch[1]);
    intent.experienceMin = years;
    intent.experienceMax = years + 5;
  }

  // Extract company keywords
  const companyPatterns = [
    /\b(?:at|from|worked at|ex-)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)/g,
  ];

  for (const pattern of companyPatterns) {
    const matches = query.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        intent.companyKeywords.push(match[1]);
      }
    }
  }

  // Extract exclusions
  const excludeMatch = lower.match(/(?:exclude|without|not|no)\s+(\w+(?:\s+\w+)?)/g);
  if (excludeMatch) {
    intent.excludeKeywords = excludeMatch.map((m) =>
      m.replace(/(?:exclude|without|not|no)\s+/, "")
    );
  }

  // Determine suggested sources
  const suggestedSources: SourceType[] = ["internal_db"]; // Always search internal DB first

  if (intent.skills.length > 0 || intent.titleKeywords.length > 0) {
    suggestedSources.push("google_cse", "github");
  }

  if (intent.skills.some((s) => isProgrammingLanguage(s))) {
    if (!suggestedSources.includes("github")) {
      suggestedSources.push("github");
    }
  }

  suggestedSources.push("resume_upload");

  // Calculate confidence
  let confidence = 0.5;
  if (intent.skills.length > 0) confidence += 0.15;
  if (intent.titleKeywords.length > 0) confidence += 0.1;
  if (intent.location) confidence += 0.1;
  if (intent.seniority !== "any") confidence += 0.1;
  if (intent.industry) confidence += 0.05;

  return {
    intent,
    confidence: Math.min(confidence, 1),
    suggestedSources,
  };
}

/**
 * Build a SourcingQuery from parsed intent
 */
export function buildSourcingQuery(
  intent: SourcingIntent,
  sources?: SourceType[],
  limit: number = 25
): SourcingQuery {
  const filters: SourcingFilters = {
    location: intent.location,
    minExperience: intent.experienceMin,
    maxExperience: intent.experienceMax,
    skills: intent.skills,
    companies: intent.companyKeywords,
    titles: intent.titleKeywords,
  };

  return {
    id: `sq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    intent,
    sources: sources || ["internal_db", "google_cse", "github", "resume_upload"],
    limit,
    filters,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Execute a sourcing query across all specified sources
 */
export async function executeSourcingQuery(
  query: SourcingQuery,
  onProgress?: (source: SourceType, status: "started" | "completed" | "failed") => void
): Promise<SourcingJob> {
  const job: SourcingJob = {
    id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    query,
    status: "running",
    sourcesQueried: query.sources,
    sourcesCompleted: [],
    sourcesFailed: [],
    totalResults: 0,
    normalizedResults: 0,
    enrichedResults: 0,
    results: [],
    errors: [],
    startedAt: new Date().toISOString(),
  };

  // Dispatch to all sources in parallel
  const sourcePromises = query.sources.map(async (sourceType) => {
    const connector = getConnector(sourceType);
    if (!connector) {
      job.errors.push({
        source: sourceType,
        error: "Connector not available",
        timestamp: new Date().toISOString(),
      });
      job.sourcesFailed.push(sourceType);
      return [];
    }

    onProgress?.(sourceType, "started");

    try {
      const results = await connector.search(query);
      job.sourcesCompleted.push(sourceType);
      onProgress?.(sourceType, "completed");
      return results;
    } catch (err: any) {
      job.sourcesFailed.push(sourceType);
      job.errors.push({
        source: sourceType,
        error: err.message || "Search failed",
        timestamp: new Date().toISOString(),
      });
      onProgress?.(sourceType, "failed");
      return [];
    }
  });

  const allRawResults = (await Promise.all(sourcePromises)).flat();
  job.totalResults = allRawResults.length;

  // Normalize results
  const normalized = allRawResults
    .map((raw) => normalizeCandidate(raw))
    .filter((c): c is NormalizedCandidate => c !== null);

  const deduplicated = deduplicateCandidates(normalized);
  job.normalizedResults = deduplicated.length;

  // Enrich results
  const enriched: EnrichedCandidate[] = [];
  for (const candidate of deduplicated) {
    const enrichedCandidate = await enrichCandidate(candidate, query.intent);
    enriched.push(enrichedCandidate);
  }

  // Sort by match score
  enriched.sort((a, b) => b.matchScore - a.matchScore);

  job.enrichedResults = enriched.length;
  job.results = enriched;
  job.status = "completed";
  job.completedAt = new Date().toISOString();

  return job;
}

/**
 * Build system prompt for sourcing AI
 */
export function buildSourcingSystemPrompt(): string {
  return `You are Fintelos Sourcing AI, an expert talent sourcing assistant.

Your job is to help recruiters find the best candidates by:
1. Understanding their sourcing intent from natural language
2. Searching across multiple sources (internal DB, Google, GitHub, resumes)
3. Normalizing and enriching candidate data
4. Ranking candidates by relevance and fit

When a recruiter describes what they're looking for, parse their intent into:
- Required skills
- Seniority level
- Location preferences
- Industry experience
- Company preferences
- Experience range

Provide clear explanations for why candidates match the sourcing criteria.`;
}

// Helper
const PROGRAMMING_LANGUAGES = new Set([
  "javascript", "typescript", "python", "java", "go", "golang", "rust",
  "c++", "c#", "ruby", "php", "swift", "kotlin", "scala",
]);

function isProgrammingLanguage(skill: string): boolean {
  return PROGRAMMING_LANGUAGES.has(skill.toLowerCase());
}
