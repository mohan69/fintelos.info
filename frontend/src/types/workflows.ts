/**
 * Workflow System Type Definitions
 *
 * Supports autonomous recruiter workflows including outreach generation,
 * candidate comparison, sourcing sessions, and workflow chaining.
 */

// Workflow step types
export type WorkflowStepType =
  | "source"
  | "rank"
  | "compare"
  | "outreach"
  | "analyze"
  | "recommend"
  | "wait"
  | "condition";

export type WorkflowStepStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "skipped";

export interface WorkflowStep {
  id: string;
  type: WorkflowStepType;
  name: string;
  description?: string;
  status: WorkflowStepStatus;
  config: Record<string, unknown>;
  result?: unknown;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

// Outreach types
export type OutreachChannel = "email" | "linkedin" | "whatsapp" | "sms";
export type OutreachTone = "professional" | "friendly" | "casual" | "formal";

export interface OutreachRequest {
  candidateId: string;
  channel: OutreachChannel;
  tone: OutreachTone;
  context?: string;
  recruiterPreferences?: Record<string, unknown>;
}

export interface OutreachDraft {
  id: string;
  candidateId: string;
  candidateName: string;
  channel: OutreachChannel;
  subject?: string;
  body: string;
  tone: OutreachTone;
  personalizations: string[];
  generatedAt: string;
  status: "draft" | "sent" | "scheduled";
}

export interface OutreachSequence {
  id: string;
  name: string;
  candidateId: string;
  steps: OutreachSequenceStep[];
  status: "active" | "paused" | "completed";
  createdAt: string;
}

export interface OutreachSequenceStep {
  id: string;
  order: number;
  channel: OutreachChannel;
  delayDays: number;
  template: string;
  status: "pending" | "sent" | "skipped";
}

// Candidate comparison types
export interface CandidateComparison {
  id: string;
  candidates: ComparisonCandidate[];
  criteria: ComparisonCriteria;
  recommendation: string;
  generatedAt: string;
}

export interface ComparisonCandidate {
  id: string;
  name: string;
  title?: string;
  company?: string;
  scores: {
    overall: number;
    skills: number;
    experience: number;
    stability: number;
    culture: number;
  };
  strengths: string[];
  weaknesses: string[];
  risks: string[];
}

export interface ComparisonCriteria {
  skills: string[];
  experienceRange?: { min: number; max: number };
  location?: string;
  industry?: string;
  weights?: {
    skills: number;
    experience: number;
    stability: number;
    culture: number;
  };
}

// Sourcing session types
export interface SourcingSession {
  id: string;
  name: string;
  query: string;
  status: "active" | "completed" | "paused";
  steps: WorkflowStep[];
  candidates: string[];
  outreach_drafts: string[];
  insights: RecruiterInsight[];
  started_at: string;
  completed_at?: string;
  metrics: SessionMetrics;
}

export interface SessionMetrics {
  candidates_sourced: number;
  candidates_ranked: number;
  outreach_sent: number;
  response_rate: number;
}

// Recruiter insights
export type InsightType =
  | "recommendation"
  | "warning"
  | "opportunity"
  | "pattern"
  | "metric";

export interface RecruiterInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  actionable: boolean;
  suggestedAction?: string;
  relatedCandidates?: string[];
  generatedAt: string;
}

// Command center data
export interface CommandCenterData {
  active_sessions: SourcingSession[];
  recent_activity: ActivityEntry[];
  recommendations: RecruiterInsight[];
  metrics: ProductivityMetrics;
  workflow_suggestions: WorkflowSuggestion[];
}

export interface ActivityEntry {
  id: string;
  type: "sourcing" | "outreach" | "comparison" | "workflow" | "memory";
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ProductivityMetrics {
  candidates_sourced_today: number;
  outreach_sent_today: number;
  responses_received: number;
  active_workflows: number;
  avg_response_rate: number;
  top_performing_channel: string;
}

export interface WorkflowSuggestion {
  id: string;
  name: string;
  description: string;
  type: "sourcing" | "outreach" | "comparison" | "analysis";
  estimated_time: string;
  confidence: number;
  steps: string[];
}

// Workflow execution context
export interface WorkflowContext {
  sessionId?: string;
  recruiterId: string;
  memoryContext: string[];
  sourcingResults?: unknown[];
  selectedCandidates?: string[];
  outreachHistory?: OutreachDraft[];
}
