/**
 * Workflow Orchestration Engine
 *
 * Manages autonomous recruiter workflows including sourcing-to-outreach
 * chaining, next-best-action recommendations, and workflow execution.
 */

import type {
  WorkflowStep,
  WorkflowStepType,
  SourcingSession,
  RecruiterInsight,
  WorkflowSuggestion,
  CommandCenterData,
  OutreachChannel,
  OutreachDraft,
  CandidateComparison,
} from "@/types/workflows";
import type { EnrichedCandidate, SourcingJob } from "@/types/sourcing";
import { api, type Candidate, type Memory } from "./api";
import { parseSourcingIntent, executeSourcingQuery, buildSourcingQuery } from "./sourcing-engine";
import { generateOutreach, generateOutreachSequence } from "./outreach-engine";

/**
 * Execute a full sourcing-to-outreach workflow
 */
export async function executeSourcingWorkflow(
  query: string,
  onStepUpdate?: (step: WorkflowStep) => void
): Promise<SourcingSession> {
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const steps: WorkflowStep[] = [];
  const insights: RecruiterInsight[] = [];

  // Step 1: Parse intent
  const parseStep = createStep("source", "Parse Sourcing Intent", "Analyzing your query to understand requirements");
  steps.push(parseStep);
  onStepUpdate?.(parseStep);

  const intentResult = parseSourcingIntent(query);
  parseStep.status = "completed";
  parseStep.result = intentResult;
  onStepUpdate?.(parseStep);

  // Add insight about parsed intent
  insights.push({
    id: `insight-${Date.now()}-1`,
    type: "recommendation",
    title: "Intent Analysis",
    description: `Detected ${intentResult.intent.skills.length} skills, ${intentResult.intent.seniority} seniority${intentResult.intent.location ? `, location: ${intentResult.intent.location}` : ""}`,
    priority: "medium",
    actionable: false,
    generatedAt: new Date().toISOString(),
  });

  // Step 2: Execute sourcing
  const sourceStep = createStep("source", "Source Candidates", "Searching across multiple sources");
  steps.push(sourceStep);
  onStepUpdate?.(sourceStep);

  const sourcingQuery = buildSourcingQuery(intentResult.intent);
  const sourcingJob = await executeSourcingQuery(sourcingQuery, (source, status) => {
    sourceStep.description = `Searching ${source}: ${status}`;
    onStepUpdate?.(sourceStep);
  });

  sourceStep.status = "completed";
  sourceStep.result = sourcingJob;
  onStepUpdate?.(sourceStep);

  // Step 3: Rank candidates
  const rankStep = createStep("rank", "Rank Candidates", "AI-ranking candidates by fit");
  steps.push(rankStep);
  onStepUpdate?.(rankStep);

  const rankedCandidates = sourcingJob.results
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);

  rankStep.status = "completed";
  rankStep.result = rankedCandidates;
  onStepUpdate?.(rankStep);

  // Add ranking insight
  if (rankedCandidates.length > 0) {
    const topCandidate = rankedCandidates[0];
    insights.push({
      id: `insight-${Date.now()}-2`,
      type: "recommendation",
      title: "Top Candidate Identified",
      description: `${topCandidate.fullName} is the top match with ${Math.round(topCandidate.matchScore * 100)}% fit score`,
      priority: "high",
      actionable: true,
      suggestedAction: "Generate outreach for top candidate",
      relatedCandidates: [topCandidate.id],
      generatedAt: new Date().toISOString(),
    });
  }

  // Step 4: Generate recommendations
  const recommendStep = createStep("recommend", "Generate Recommendations", "Analyzing results for actionable insights");
  steps.push(recommendStep);
  onStepUpdate?.(recommendStep);

  const recommendations = generateWorkflowRecommendations(
    intentResult.intent,
    rankedCandidates,
    sourcingJob
  );
  insights.push(...recommendations);

  recommendStep.status = "completed";
  recommendStep.result = recommendations;
  onStepUpdate?.(recommendStep);

  // Create session
  const session: SourcingSession = {
    id: sessionId,
    name: `Sourcing: ${query.slice(0, 50)}...`,
    query,
    status: "completed",
    steps,
    candidates: rankedCandidates.map((c) => c.id),
    outreach_drafts: [],
    insights,
    started_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    metrics: {
      candidates_sourced: sourcingJob.totalResults,
      candidates_ranked: rankedCandidates.length,
      outreach_sent: 0,
      response_rate: 0,
    },
  };

  return session;
}

/**
 * Generate next-best-action recommendations
 */
export function generateNextBestActions(
  session: SourcingSession,
  candidates: Candidate[],
  memoryContext?: Memory[]
): WorkflowSuggestion[] {
  const suggestions: WorkflowSuggestion[] = [];

  // If we have candidates but no outreach
  if (session.candidates.length > 0 && session.outreach_drafts.length === 0) {
    suggestions.push({
      id: "suggest-outreach",
      name: "Generate Outreach",
      description: `Send personalized outreach to your ${session.candidates.length} sourced candidates`,
      type: "outreach",
      estimated_time: "2 min",
      confidence: 0.9,
      steps: [
        "Select top candidates",
        "Choose outreach channel",
        "Generate personalized messages",
        "Review and send",
      ],
    });
  }

  // If we have candidates, suggest comparison
  if (session.candidates.length >= 2) {
    suggestions.push({
      id: "suggest-compare",
      name: "Compare Top Candidates",
      description: "Side-by-side AI comparison of your top candidates",
      type: "comparison",
      estimated_time: "1 min",
      confidence: 0.85,
      steps: [
        "Select candidates to compare",
        "AI analyzes strengths and weaknesses",
        "Get hiring recommendation",
      ],
    });
  }

  // If outreach was sent, suggest follow-up
  if (session.outreach_drafts.length > 0) {
    suggestions.push({
      id: "suggest-followup",
      name: "Schedule Follow-ups",
      description: "Create a follow-up sequence for non-responders",
      type: "outreach",
      estimated_time: "3 min",
      confidence: 0.75,
      steps: [
        "Identify non-responders",
        "Create follow-up sequence",
        "Schedule sends",
      ],
    });
  }

  // Suggest expanding search
  if (session.candidates.length < 5) {
    suggestions.push({
      id: "suggest-expand",
      name: "Expand Search",
      description: "Try additional sources or broaden criteria to find more candidates",
      type: "sourcing",
      estimated_time: "2 min",
      confidence: 0.7,
      steps: [
        "Add more sources",
        "Broaden search criteria",
        "Re-run sourcing",
      ],
    });
  }

  return suggestions;
}

/**
 * Generate workflow recommendations based on sourcing results
 */
function generateWorkflowRecommendations(
  intent: ReturnType<typeof parseSourcingIntent>["intent"],
  candidates: EnrichedCandidate[],
  job: SourcingJob
): RecruiterInsight[] {
  const insights: RecruiterInsight[] = [];

  // Low results warning
  if (candidates.length < 3) {
    insights.push({
      id: `insight-warn-${Date.now()}`,
      type: "warning",
      title: "Limited Results",
      description: `Only ${candidates.length} candidates found. Consider broadening your search criteria or adding more sources.`,
      priority: "high",
      actionable: true,
      suggestedAction: "Expand search with additional sources",
      generatedAt: new Date().toISOString(),
    });
  }

  // Source diversity insight
  const sourceTypes = new Set(candidates.map((c) => c.source));
  if (sourceTypes.size === 1) {
    insights.push({
      id: `insight-source-${Date.now()}`,
      type: "opportunity",
      title: "Single Source Results",
      description: "All results came from one source. Enabling more sources could improve coverage.",
      priority: "medium",
      actionable: true,
      suggestedAction: "Enable additional sourcing sources",
      generatedAt: new Date().toISOString(),
    });
  }

  // High-match candidates insight
  const highMatchCount = candidates.filter((c) => c.matchScore >= 0.8).length;
  if (highMatchCount > 0) {
    insights.push({
      id: `insight-match-${Date.now()}`,
      type: "opportunity",
      title: "Strong Candidates Found",
      description: `${highMatchCount} candidates have 80%+ match score. Prioritize outreach to these candidates.`,
      priority: "high",
      actionable: true,
      suggestedAction: "Generate outreach for top matches",
      generatedAt: new Date().toISOString(),
    });
  }

  // Response likelihood insight
  const highResponseCandidates = candidates.filter(
    (c) => c.enrichment?.responseLikelihood && c.enrichment.responseLikelihood >= 0.7
  );
  if (highResponseCandidates.length > 0) {
    insights.push({
      id: `insight-response-${Date.now()}`,
      type: "recommendation",
      title: "High Response Likelihood",
      description: `${highResponseCandidates.length} candidates are likely to respond. Consider reaching out to them first.`,
      priority: "medium",
      actionable: true,
      suggestedAction: "Prioritize outreach to high-response candidates",
      relatedCandidates: highResponseCandidates.map((c) => c.id),
      generatedAt: new Date().toISOString(),
    });
  }

  return insights;
}

/**
 * Create a workflow step
 */
function createStep(
  type: WorkflowStepType,
  name: string,
  description?: string
): WorkflowStep {
  return {
    id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    name,
    description,
    status: "running",
    config: {},
    startedAt: new Date().toISOString(),
  };
}

/**
 * Execute outreach for selected candidates
 */
export async function executeOutreachWorkflow(
  candidates: Candidate[],
  channel: OutreachChannel,
  memoryContext?: Memory[]
): Promise<{
  drafts: OutreachDraft[];
  insights: RecruiterInsight[];
}> {
  const drafts = [];
  const insights: RecruiterInsight[] = [];

  for (const candidate of candidates.slice(0, 5)) {
    try {
      const draft = await generateOutreach(
        candidate,
        channel,
        "professional",
        memoryContext
      );
      drafts.push(draft);
    } catch {
      insights.push({
        id: `insight-error-${Date.now()}`,
        type: "warning",
        title: "Outreach Generation Failed",
        description: `Failed to generate outreach for ${candidate.full_name}`,
        priority: "medium",
        actionable: false,
        generatedAt: new Date().toISOString(),
      });
    }
  }

  if (drafts.length > 0) {
    insights.push({
      id: `insight-outreach-${Date.now()}`,
      type: "recommendation",
      title: "Outreach Ready",
      description: `${drafts.length} outreach messages generated and ready to send`,
      priority: "high",
      actionable: true,
      suggestedAction: "Review and send outreach messages",
      generatedAt: new Date().toISOString(),
    });
  }

  return { drafts, insights };
}

/**
 * Compare candidates using AI analysis
 */
export async function executeComparisonWorkflow(
  candidates: Candidate[],
  criteria?: Record<string, unknown>
): Promise<CandidateComparison> {
  // Try API first, fall back to local analysis
  try {
    const result = await api.comparison.analyze({
      candidate_ids: candidates.map((c) => c.id),
      criteria,
    });
    return result as unknown as CandidateComparison;
  } catch {
    // Local comparison fallback
    return generateLocalComparison(candidates, criteria);
  }
}

/**
 * Generate local comparison when API is unavailable
 */
function generateLocalComparison(
  candidates: Candidate[],
  criteria?: { skills?: string[]; experienceRange?: { min: number; max: number }; location?: string; industry?: string }
): CandidateComparison {
  const comparisonCandidates = candidates.map((candidate) => ({
    id: candidate.id,
    name: candidate.full_name,
    title: candidate.current_title,
    company: candidate.current_company,
    scores: {
      overall: candidate.ai_score,
      skills: calculateSkillsScore(candidate),
      experience: calculateExperienceScore(candidate),
      stability: candidate.job_stability_score,
      culture: calculateCultureScore(candidate),
    },
    strengths: identifyStrengths(candidate),
    weaknesses: identifyWeaknesses(candidate),
    risks: identifyRisks(candidate),
  }));

  // Find best candidate
  const sorted = [...comparisonCandidates].sort(
    (a, b) => b.scores.overall - a.scores.overall
  );

  return {
    id: `comp-${Date.now()}`,
    candidates: comparisonCandidates,
    criteria: {
      skills: criteria?.skills || [],
      experienceRange: criteria?.experienceRange,
      location: criteria?.location,
      industry: criteria?.industry,
    },
    recommendation: `${sorted[0].name} is the strongest candidate overall with ${Math.round(sorted[0].scores.overall * 100)}% fit score.`,
    generatedAt: new Date().toISOString(),
  };
}

function calculateSkillsScore(candidate: Candidate): number {
  if (candidate.skills.length >= 5) return 0.9;
  if (candidate.skills.length >= 3) return 0.7;
  return 0.5;
}

function calculateExperienceScore(candidate: Candidate): number {
  if (!candidate.experience_years) return 0.5;
  if (candidate.experience_years >= 5 && candidate.experience_years <= 10) return 0.9;
  if (candidate.experience_years >= 3) return 0.7;
  return 0.5;
}

function calculateCultureScore(candidate: Candidate): number {
  // Heuristic based on profile completeness
  let score = 0.5;
  if (candidate.email) score += 0.1;
  if (candidate.current_company) score += 0.2;
  if (candidate.skills.length >= 3) score += 0.2;
  return Math.min(score, 1);
}

function identifyStrengths(candidate: Candidate): string[] {
  const strengths: string[] = [];
  if (candidate.ai_score >= 0.8) strengths.push("High AI match score");
  if (candidate.experience_years && candidate.experience_years >= 5) strengths.push("Senior experience");
  if (candidate.skills.length >= 5) strengths.push("Diverse skill set");
  if (candidate.job_stability_score >= 0.7) strengths.push("Strong job stability");
  if (candidate.response_likelihood >= 0.7) strengths.push("High response likelihood");
  return strengths.length > 0 ? strengths : ["Profile available"];
}

function identifyWeaknesses(candidate: Candidate): string[] {
  const weaknesses: string[] = [];
  if (candidate.ai_score < 0.6) weaknesses.push("Lower match score");
  if (!candidate.experience_years) weaknesses.push("Experience not specified");
  if (candidate.skills.length < 3) weaknesses.push("Limited skills listed");
  if (candidate.response_likelihood < 0.5) weaknesses.push("Lower response likelihood");
  return weaknesses;
}

function identifyRisks(candidate: Candidate): string[] {
  const risks: string[] = [];
  if (candidate.job_stability_score < 0.5) risks.push("May be flight risk");
  if (candidate.response_likelihood < 0.4) risks.push("Unlikely to respond");
  if (!candidate.email) risks.push("No direct contact info");
  return risks;
}
