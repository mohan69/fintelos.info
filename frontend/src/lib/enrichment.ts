/**
 * Candidate Enrichment Pipeline
 *
 * Enriches normalized candidates with AI scoring,
 * company analysis, skill depth assessment, and
 * career trajectory prediction.
 */

import type {
  NormalizedCandidate,
  EnrichedCandidate,
  EnrichmentData,
  SkillDepth,
  SourcingIntent,
} from "@/types/sourcing";

/**
 * Enrich a normalized candidate with AI-derived data
 */
export async function enrichCandidate(
  candidate: NormalizedCandidate,
  intent: SourcingIntent
): Promise<EnrichedCandidate> {
  const enrichment = calculateEnrichment(candidate);
  const matchScore = calculateMatchScore(candidate, intent, enrichment);
  const matchReasons = generateMatchReasons(candidate, intent);

  return {
    ...candidate,
    enrichment,
    matchScore,
    matchReasons,
  };
}

/**
 * Calculate enrichment data for a candidate
 */
function calculateEnrichment(candidate: NormalizedCandidate): EnrichmentData {
  const skillDepth = assessSkillDepth(candidate);
  const companyTier = estimateCompanyTier(candidate.currentCompany);
  const careerTrajectory = assessCareerTrajectory(candidate);

  // AI Score: composite of multiple factors
  const aiScore = calculateAIScore(candidate, skillDepth, companyTier);

  // Stability: based on tenure patterns and company type
  const jobStabilityScore = calculateStabilityScore(candidate, companyTier);

  // Response likelihood: based on profile completeness and activity
  const responseLikelihood = calculateResponseLikelihood(candidate);

  return {
    candidateId: candidate.id,
    aiScore,
    jobStabilityScore,
    responseLikelihood,
    companyTier,
    skillDepth,
    careerTrajectory,
    enrichedAt: new Date().toISOString(),
  };
}

/**
 * Calculate match score between candidate and intent
 */
function calculateMatchScore(
  candidate: NormalizedCandidate,
  intent: SourcingIntent,
  enrichment: EnrichmentData
): number {
  let score = 0;
  let maxScore = 0;

  // Skills match (weight: 30)
  maxScore += 30;
  if (intent.skills.length > 0) {
    const candidateSkills = candidate.skills.map((s) => s.toLowerCase());
    const matchedSkills = intent.skills.filter((s) =>
      candidateSkills.some((cs) => cs.includes(s.toLowerCase()) || s.toLowerCase().includes(cs))
    );
    score += (matchedSkills.length / intent.skills.length) * 30;
  } else {
    score += 15; // Neutral if no skills specified
  }

  // Title match (weight: 20)
  maxScore += 20;
  if (intent.titleKeywords.length > 0 && candidate.currentTitle) {
    const titleLower = candidate.currentTitle.toLowerCase();
    const titleMatches = intent.titleKeywords.some((k) =>
      titleLower.includes(k.toLowerCase())
    );
    score += titleMatches ? 20 : 5;
  } else {
    score += 10;
  }

  // Location match (weight: 15)
  maxScore += 15;
  if (intent.location && candidate.location) {
    const locationMatch = candidate.location
      .toLowerCase()
      .includes(intent.location.toLowerCase());
    score += locationMatch ? 15 : 0;
  } else if (!intent.location) {
    score += 10; // Neutral if no location specified
  }

  // Seniority match (weight: 15)
  maxScore += 15;
  if (intent.seniority !== "any" && candidate.experienceYears) {
    const seniorityMatch = matchesSeniority(
      candidate.experienceYears,
      intent.seniority
    );
    score += seniorityMatch ? 15 : 5;
  } else {
    score += 8;
  }

  // Industry match (weight: 10)
  maxScore += 10;
  if (intent.industry && candidate.currentCompany) {
    // Simple heuristic: check if company name suggests industry
    const industryMatch = matchesIndustry(
      candidate.currentCompany,
      intent.industry
    );
    score += industryMatch ? 10 : 3;
  } else {
    score += 5;
  }

  // AI quality signals (weight: 10)
  maxScore += 10;
  score += enrichment.aiScore * 10;

  return Math.min(score / maxScore, 1);
}

/**
 * Generate match reasons explaining why a candidate matches
 */
function generateMatchReasons(
  candidate: NormalizedCandidate,
  intent: SourcingIntent
): string[] {
  const reasons: string[] = [];

  // Skills
  if (intent.skills.length > 0) {
    const matchedSkills = intent.skills.filter((s) =>
      candidate.skills.some((cs) =>
        cs.toLowerCase().includes(s.toLowerCase()) ||
        s.toLowerCase().includes(cs.toLowerCase())
      )
    );
    if (matchedSkills.length > 0) {
      reasons.push(`Skills: ${matchedSkills.join(", ")}`);
    }
  }

  // Title
  if (intent.titleKeywords.length > 0 && candidate.currentTitle) {
    const matchedTitle = intent.titleKeywords.find((k) =>
      candidate.currentTitle!.toLowerCase().includes(k.toLowerCase())
    );
    if (matchedTitle) {
      reasons.push(`Title: ${candidate.currentTitle}`);
    }
  }

  // Location
  if (intent.location && candidate.location?.toLowerCase().includes(intent.location.toLowerCase())) {
    reasons.push(`Location: ${candidate.location}`);
  }

  // Seniority
  if (intent.seniority !== "any" && candidate.experienceYears) {
    if (matchesSeniority(candidate.experienceYears, intent.seniority)) {
      reasons.push(`${intent.seniority} level (${candidate.experienceYears}y exp)`);
    }
  }

  // Company
  if (intent.companyKeywords.length > 0 && candidate.currentCompany) {
    const matchedCompany = intent.companyKeywords.find((k) =>
      candidate.currentCompany!.toLowerCase().includes(k.toLowerCase())
    );
    if (matchedCompany) {
      reasons.push(`Company: ${candidate.currentCompany}`);
    }
  }

  // Source diversity
  if (candidate.socialProfiles.length > 1) {
    reasons.push(`Multiple profiles found`);
  }

  if (reasons.length === 0) {
    reasons.push("Profile match");
  }

  return reasons;
}

// --- Scoring functions ---

function calculateAIScore(
  candidate: NormalizedCandidate,
  skillDepth: SkillDepth[],
  companyTier?: string
): number {
  let score = 0.5; // Base score

  // Skills breadth and depth
  if (candidate.skills.length >= 5) score += 0.1;
  if (skillDepth.some((s) => s.level === "expert")) score += 0.1;
  if (skillDepth.some((s) => s.level === "advanced")) score += 0.05;

  // Company tier
  if (companyTier === "tier1") score += 0.15;
  if (companyTier === "tier2") score += 0.1;

  // Experience
  if (candidate.experienceYears && candidate.experienceYears >= 5) score += 0.1;

  // Profile completeness
  if (candidate.email) score += 0.05;
  if (candidate.socialProfiles.length > 0) score += 0.05;

  return Math.min(score, 1);
}

function calculateStabilityScore(
  candidate: NormalizedCandidate,
  companyTier?: string
): number {
  let score = 0.6; // Base

  // Company tier suggests stability
  if (companyTier === "tier1") score += 0.2;
  if (companyTier === "tier2") score += 0.1;

  // More experience suggests stability
  if (candidate.experienceYears && candidate.experienceYears >= 3) score += 0.15;

  return Math.min(score, 1);
}

function calculateResponseLikelihood(candidate: NormalizedCandidate): number {
  let score = 0.5;

  // Having email increases likelihood
  if (candidate.email) score += 0.2;

  // Having social profiles
  if (candidate.socialProfiles.length > 0) score += 0.15;

  // GitHub presence (developers tend to respond)
  if (candidate.socialProfiles.some((p) => p.platform === "github")) {
    score += 0.1;
  }

  return Math.min(score, 1);
}

function assessSkillDepth(candidate: NormalizedCandidate): SkillDepth[] {
  return candidate.skills.map((skill) => {
    // Simple heuristic: if it's in their title or primary skills, assume higher depth
    const inTitle = candidate.currentTitle
      ?.toLowerCase()
      .includes(skill.toLowerCase());

    return {
      skill,
      level: inTitle ? "advanced" : "intermediate",
      confidence: inTitle ? 0.7 : 0.4,
    };
  });
}

function estimateCompanyTier(company?: string): string | undefined {
  if (!company) return undefined;

  const lower = company.toLowerCase();

  // Tier 1: Major tech companies
  const tier1 = [
    "google", "apple", "meta", "facebook", "amazon", "microsoft", "netflix",
    "tesla", "nvidia", "salesforce", "adobe", "oracle", "ibm", "intel",
  ];

  if (tier1.some((t) => lower.includes(t))) return "tier1";

  // Tier 2: Well-known companies
  const tier2 = [
    "uber", "airbnb", "stripe", "shopify", "twitter", "linkedin", "spotify",
    "slack", "dropbox", "pinterest", "snap", "tiktok", "bytedance",
    "flipkart", "zomato", "swiggy", "paytm", "razorpay",
  ];

  if (tier2.some((t) => lower.includes(t))) return "tier2";

  return "other";
}

function assessCareerTrajectory(
  candidate: NormalizedCandidate
): "ascending" | "stable" | "transitioning" | "declining" {
  if (!candidate.experienceYears) return "stable";

  // Heuristic: younger professionals with good skills are ascending
  if (candidate.experienceYears < 5 && candidate.skills.length >= 3) {
    return "ascending";
  }

  // Senior with many skills is stable
  if (candidate.experienceYears >= 8 && candidate.skills.length >= 5) {
    return "stable";
  }

  return "stable";
}

function matchesSeniority(
  experienceYears: number,
  seniority: string
): boolean {
  switch (seniority) {
    case "junior":
      return experienceYears <= 2;
    case "mid":
      return experienceYears >= 2 && experienceYears <= 5;
    case "senior":
      return experienceYears >= 5 && experienceYears <= 10;
    case "lead":
      return experienceYears >= 8;
    default:
      return true;
  }
}

function matchesIndustry(company: string, industry: string): boolean {
  const lower = company.toLowerCase();
  const industryLower = industry.toLowerCase();

  // Simple keyword matching
  const industryKeywords: Record<string, string[]> = {
    banking: ["bank", "financial", "capital", "invest"],
    fintech: ["pay", "fin", "lend", "credit", "wallet"],
    healthcare: ["health", "medical", "pharma", "bio", "care"],
    saas: ["cloud", "software", "platform", "service"],
    "e-commerce": ["shop", "commerce", "retail", "market"],
    gaming: ["game", "play", "esports"],
    crypto: ["crypto", "blockchain", "web3", "defi"],
  };

  const keywords = industryKeywords[industryLower] || [];
  return keywords.some((k) => lower.includes(k));
}
