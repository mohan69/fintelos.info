/**
 * Candidate Normalization Pipeline
 *
 * Normalizes raw sourcing results from different sources into
 * a unified NormalizedCandidate format with deduplication.
 */

import type {
  RawSourcingResult,
  NormalizedCandidate,
  EducationEntry,
  SocialProfile,
  SourceType,
} from "@/types/sourcing";

/**
 * Normalize a raw sourcing result into a NormalizedCandidate
 */
export function normalizeCandidate(
  raw: RawSourcingResult
): NormalizedCandidate | null {
  try {
    switch (raw.source) {
      case "google_cse":
        return normalizeGoogleCSEResult(raw);
      case "github":
        return normalizeGitHubResult(raw);
      case "internal_db":
        return normalizeInternalDBResult(raw);
      case "resume_upload":
        return normalizeResumeResult(raw);
      default:
        return normalizeGenericResult(raw);
    }
  } catch {
    return null;
  }
}

/**
 * Normalize Google CSE result
 */
function normalizeGoogleCSEResult(raw: RawSourcingResult): NormalizedCandidate | null {
  const data = raw.data;
  const title = (data.title as string) || "";
  const snippet = (data.snippet as string) || "";
  const link = (data.link as string) || "";

  // Try to extract name from title (usually "Name - Title - Company | LinkedIn")
  const titleParts = title.split(/[-|·]/).map((s: string) => s.trim());
  const fullName = titleParts[0] || "Unknown";

  // Extract title and company from snippet or title
  let currentTitle: string | undefined;
  let currentCompany: string | undefined;

  if (titleParts.length > 1) {
    currentTitle = titleParts[1];
  }
  if (titleParts.length > 2) {
    currentCompany = titleParts[2];
  }

  // Extract skills from snippet
  const skills = extractSkillsFromText(snippet);

  // Extract location
  const location = extractLocationFromText(snippet);

  // Determine source platform
  const isLinkedIn = link.includes("linkedin.com");
  const isGitHub = link.includes("github.com");

  const socialProfiles: SocialProfile[] = [];
  if (isLinkedIn) {
    socialProfiles.push({ platform: "linkedin", url: link });
  }
  if (isGitHub) {
    socialProfiles.push({ platform: "github", url: link });
  }

  return {
    id: `gse-${hashString(raw.sourceId)}`,
    fullName,
    currentTitle,
    currentCompany,
    location,
    skills,
    socialProfiles,
    source: "google_cse",
    sourceId: raw.sourceId,
    sourceUrl: raw.sourceUrl,
    raw: raw.data,
    normalizedAt: new Date().toISOString(),
  };
}

/**
 * Normalize GitHub result
 */
function normalizeGitHubResult(raw: RawSourcingResult): NormalizedCandidate | null {
  const data = raw.data;
  const login = data.login as string;
  const name = (data.name as string) || login;
  const bio = (data.bio as string) || "";
  const company = (data.company as string) || undefined;
  const location = (data.location as string) || undefined;
  const email = (data.email as string) || undefined;
  const blog = (data.blog as string) || undefined;

  // Extract skills from languages and bio
  const languages = (data.languages as string[]) || [];
  const bioSkills = extractSkillsFromText(bio);
  const skills = [...new Set([...languages, ...bioSkills])];

  // Infer experience from repos and followers
  const publicRepos = (data.public_repos as number) || 0;
  const followers = (data.followers as number) || 0;
  const experienceYears = estimateExperienceFromGitHub(publicRepos, followers);

  // Infer title from bio or repos
  const currentTitle = inferTitleFromBio(bio) || "Software Engineer";

  const socialProfiles: SocialProfile[] = [
    { platform: "github", url: `https://github.com/${login}`, username: login },
  ];

  if (blog) {
    socialProfiles.push({ platform: "website", url: blog });
  }

  return {
    id: `gh-${login}`,
    fullName: name,
    email,
    currentTitle,
    currentCompany: company?.replace(/^@/, ""),
    location,
    skills,
    experienceYears,
    socialProfiles,
    source: "github",
    sourceId: raw.sourceId,
    sourceUrl: raw.sourceUrl,
    raw: raw.data,
    normalizedAt: new Date().toISOString(),
  };
}

/**
 * Normalize internal DB result
 */
function normalizeInternalDBResult(raw: RawSourcingResult): NormalizedCandidate | null {
  const data = raw.data;

  return {
    id: `db-${data.id || raw.sourceId}`,
    fullName: (data.full_name as string) || "Unknown",
    email: data.email as string | undefined,
    currentTitle: data.current_title as string | undefined,
    currentCompany: data.current_company as string | undefined,
    location: data.location as string | undefined,
    skills: (data.skills as string[]) || [],
    experienceYears: data.experience_years as number | undefined,
    socialProfiles: [],
    source: "internal_db",
    sourceId: raw.sourceId,
    sourceUrl: raw.sourceUrl,
    raw: raw.data,
    normalizedAt: new Date().toISOString(),
  };
}

/**
 * Normalize resume result
 */
function normalizeResumeResult(raw: RawSourcingResult): NormalizedCandidate | null {
  const data = raw.data;

  return {
    id: `resume-${data.id || raw.sourceId}`,
    fullName: (data.candidate_name as string) || (data.name as string) || "Unknown",
    email: data.email as string | undefined,
    phone: data.phone as string | undefined,
    currentTitle: data.current_title as string | undefined,
    currentCompany: data.current_company as string | undefined,
    location: data.location as string | undefined,
    skills: (data.skills as string[]) || [],
    experienceYears: data.experience_years as number | undefined,
    education: (data.education as EducationEntry[]) || [],
    socialProfiles: [],
    source: "resume_upload",
    sourceId: raw.sourceId,
    sourceUrl: raw.sourceUrl,
    raw: raw.data,
    normalizedAt: new Date().toISOString(),
  };
}

/**
 * Generic normalization for unknown sources
 */
function normalizeGenericResult(raw: RawSourcingResult): NormalizedCandidate | null {
  const data = raw.data;

  return {
    id: `${raw.source}-${raw.sourceId}`,
    fullName: (data.name as string) || (data.full_name as string) || "Unknown",
    email: data.email as string | undefined,
    currentTitle: (data.title as string) || (data.current_title as string),
    currentCompany: (data.company as string) || (data.current_company as string),
    location: data.location as string | undefined,
    skills: (data.skills as string[]) || [],
    experienceYears: data.experience_years as number | undefined,
    socialProfiles: [],
    source: raw.source,
    sourceId: raw.sourceId,
    sourceUrl: raw.sourceUrl,
    raw: raw.data,
    normalizedAt: new Date().toISOString(),
  };
}

/**
 * Deduplicate candidates across sources
 */
export function deduplicateCandidates(
  candidates: NormalizedCandidate[]
): NormalizedCandidate[] {
  const seen = new Map<string, NormalizedCandidate>();

  for (const candidate of candidates) {
    const key = generateDedupeKey(candidate);
    const existing = seen.get(key);

    if (!existing) {
      seen.set(key, candidate);
    } else {
      // Merge: keep the one with more data, combine social profiles
      const merged = mergeCandidates(existing, candidate);
      seen.set(key, merged);
    }
  }

  return Array.from(seen.values());
}

/**
 * Generate a deduplication key based on name + company + location
 */
function generateDedupeKey(candidate: NormalizedCandidate): string {
  const parts = [
    candidate.fullName.toLowerCase().trim(),
    (candidate.currentCompany || "").toLowerCase().trim(),
    (candidate.location || "").toLowerCase().trim(),
  ];
  return parts.join("|");
}

/**
 * Merge two duplicate candidates, keeping the most complete data
 */
function mergeCandidates(
  a: NormalizedCandidate,
  b: NormalizedCandidate
): NormalizedCandidate {
  // Prefer the one with more fields filled
  const scoreA = completenessScore(a);
  const scoreB = completenessScore(b);
  const primary = scoreA >= scoreB ? a : b;
  const secondary = scoreA >= scoreB ? b : a;

  return {
    ...primary,
    // Fill in missing fields from secondary
    email: primary.email || secondary.email,
    phone: primary.phone || secondary.phone,
    currentTitle: primary.currentTitle || secondary.currentTitle,
    currentCompany: primary.currentCompany || secondary.currentCompany,
    location: primary.location || secondary.location,
    experienceYears: primary.experienceYears || secondary.experienceYears,
    // Merge skills
    skills: [...new Set([...primary.skills, ...secondary.skills])],
    // Merge social profiles
    socialProfiles: [
      ...primary.socialProfiles,
      ...secondary.socialProfiles.filter(
        (sp) => !primary.socialProfiles.some((p) => p.platform === sp.platform)
      ),
    ],
    // Merge education
    education: primary.education || secondary.education,
  };
}

/**
 * Calculate completeness score for a candidate
 */
function completenessScore(candidate: NormalizedCandidate): number {
  let score = 0;
  if (candidate.fullName && candidate.fullName !== "Unknown") score += 2;
  if (candidate.email) score += 3;
  if (candidate.phone) score += 2;
  if (candidate.currentTitle) score += 2;
  if (candidate.currentCompany) score += 2;
  if (candidate.location) score += 1;
  if (candidate.experienceYears) score += 1;
  if (candidate.skills.length > 0) score += 2;
  if (candidate.education && candidate.education.length > 0) score += 1;
  if (candidate.socialProfiles.length > 0) score += 1;
  return score;
}

// --- Helper functions ---

const COMMON_SKILLS = new Set([
  "javascript", "typescript", "python", "java", "go", "rust", "c++", "c#",
  "ruby", "php", "swift", "kotlin", "scala", "react", "angular", "vue",
  "node", "express", "django", "flask", "spring", "rails", "docker",
  "kubernetes", "aws", "gcp", "azure", "terraform", "ansible", "jenkins",
  "git", "sql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
  "graphql", "rest", "grpc", "machine learning", "deep learning", "nlp",
  "tensorflow", "pytorch", "pandas", "numpy", "spark", "hadoop",
  "microservices", "api", "ci/cd", "agile", "scrum",
]);

function extractSkillsFromText(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];

  for (const skill of COMMON_SKILLS) {
    if (lower.includes(skill)) {
      found.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  }

  return found;
}

function extractLocationFromText(text: string): string | undefined {
  const locationPatterns = [
    /(?:located in|based in|in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
    /\b(Bangalore|Mumbai|Delhi|Hyderabad|Chennai|Pune|San Francisco|New York|London|Berlin|Toronto|Singapore|Tokyo|Sydney|Remote)\b/i,
  ];

  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match) return match[1] || match[0];
  }

  return undefined;
}

function estimateExperienceFromGitHub(repos: number, followers: number): number {
  // Rough estimation based on GitHub activity
  if (repos > 50 && followers > 200) return 10;
  if (repos > 30 && followers > 100) return 7;
  if (repos > 15 && followers > 50) return 5;
  if (repos > 5 && followers > 10) return 3;
  return 2;
}

function inferTitleFromBio(bio: string): string | undefined {
  const lower = bio.toLowerCase();

  if (lower.includes("architect")) return "Software Architect";
  if (lower.includes("staff engineer")) return "Staff Engineer";
  if (lower.includes("principal")) return "Principal Engineer";
  if (lower.includes("lead")) return "Tech Lead";
  if (lower.includes("senior") || lower.includes("sr")) return "Senior Software Engineer";
  if (lower.includes("data scientist")) return "Data Scientist";
  if (lower.includes("ml engineer") || lower.includes("machine learning")) return "ML Engineer";
  if (lower.includes("devops") || lower.includes("sre")) return "DevOps Engineer";
  if (lower.includes("frontend") || lower.includes("front-end")) return "Frontend Engineer";
  if (lower.includes("backend") || lower.includes("back-end")) return "Backend Engineer";
  if (lower.includes("full stack") || lower.includes("fullstack")) return "Full Stack Engineer";
  if (lower.includes("founder") || lower.includes("co-founder")) return "Founder";
  if (lower.includes("cto")) return "CTO";

  return undefined;
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
