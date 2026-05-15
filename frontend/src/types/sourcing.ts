/**
 * Autonomous Sourcing Engine Type Definitions
 */

// Supported sourcing sources
export type SourceType =
  | "google_cse"
  | "github"
  | "internal_db"
  | "resume_upload"
  | "linkedin"
  | "apollo"
  | "hunter"
  | "contactout";

// Source status for UI display
export interface SourceConfig {
  id: SourceType;
  name: string;
  icon: string;
  enabled: boolean;
  requiresAuth: boolean;
  description: string;
}

// Parsed intent from a natural language sourcing query
export interface SourcingIntent {
  rawQuery: string;
  skills: string[];
  seniority: "junior" | "mid" | "senior" | "lead" | "any";
  location?: string;
  industry?: string;
  experienceMin?: number;
  experienceMax?: number;
  titleKeywords: string[];
  companyKeywords: string[];
  excludeKeywords: string[];
}

// A sourcing query ready to be dispatched to sources
export interface SourcingQuery {
  id: string;
  intent: SourcingIntent;
  sources: SourceType[];
  limit: number;
  filters: SourcingFilters;
  createdAt: string;
}

export interface SourcingFilters {
  location?: string;
  minExperience?: number;
  maxExperience?: number;
  skills?: string[];
  companies?: string[];
  titles?: string[];
  availability?: "immediate" | "2_weeks" | "1_month" | "any";
}

// Raw result from any source before normalization
export interface RawSourcingResult {
  source: SourceType;
  sourceId: string;
  sourceUrl?: string;
  data: Record<string, unknown>;
  fetchedAt: string;
}

// Normalized candidate from any source
export interface NormalizedCandidate {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  currentTitle?: string;
  currentCompany?: string;
  location?: string;
  skills: string[];
  experienceYears?: number;
  education?: EducationEntry[];
  socialProfiles: SocialProfile[];
  source: SourceType;
  sourceId: string;
  sourceUrl?: string;
  raw?: Record<string, unknown>;
  normalizedAt: string;
}

export interface EducationEntry {
  school: string;
  degree?: string;
  field?: string;
  startYear?: number;
  endYear?: number;
}

export interface SocialProfile {
  platform: string;
  url: string;
  username?: string;
}

// Enrichment data added after normalization
export interface EnrichmentData {
  candidateId: string;
  aiScore: number;
  jobStabilityScore: number;
  responseLikelihood: number;
  companyTier?: string;
  skillDepth: SkillDepth[];
  careerTrajectory: "ascending" | "stable" | "transitioning" | "declining";
  enrichedAt: string;
}

export interface SkillDepth {
  skill: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  yearsUsed?: number;
  confidence: number;
}

// A sourcing job with progress tracking
export interface SourcingJob {
  id: string;
  query: SourcingQuery;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  sourcesQueried: SourceType[];
  sourcesCompleted: SourceType[];
  sourcesFailed: SourceType[];
  totalResults: number;
  normalizedResults: number;
  enrichedResults: number;
  results: EnrichedCandidate[];
  errors: SourcingError[];
  startedAt: string;
  completedAt?: string;
}

export interface SourcingError {
  source: SourceType;
  error: string;
  timestamp: string;
}

// Final enriched candidate combining normalized + enrichment
export interface EnrichedCandidate extends NormalizedCandidate {
  enrichment?: EnrichmentData;
  matchScore: number;
  matchReasons: string[];
}

// Sourcing memory - remembers recruiter patterns
export interface SourcingMemory {
  id: string;
  memory_type: "preference" | "pattern" | "feedback" | "exclusion";
  content: string;
  category?: string;
  importance: "low" | "medium" | "high";
  source_query?: string;
  created_at: string;
}

// Source connector interface
export interface SourceConnector {
  readonly sourceType: SourceType;
  readonly isAvailable: boolean;

  search(query: SourcingQuery): Promise<RawSourcingResult[]>;
  healthCheck(): Promise<boolean>;
}

// Intent parsing result
export interface IntentParseResult {
  intent: SourcingIntent;
  confidence: number;
  suggestedSources: SourceType[];
  clarifications?: string[];
}
