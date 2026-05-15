const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export interface ApiOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || `API error: ${res.status}`);
  }

  return res.json();
}

export const api = {
  auth: {
    register: (data: { email: string; password: string; full_name: string; company?: string }) =>
      apiFetch<{ access_token: string; user: User }>("/api/v1/auth/register", { method: "POST", body: data }),
    login: (data: { email: string; password: string }) =>
      apiFetch<{ access_token: string; user: User }>("/api/v1/auth/login", { method: "POST", body: data }),
  },
  chat: {
    send: (data: { message: string; conversation_id?: string }) =>
      apiFetch<ChatResponse>("/api/v1/chat/", { method: "POST", body: data }),
  },
  candidates: {
    list: () => apiFetch<Candidate[]>("/api/v1/candidates/"),
    get: (id: string) => apiFetch<Candidate>(`/api/v1/candidates/${id}`),
    create: (data: Partial<Candidate>) =>
      apiFetch<Candidate>("/api/v1/candidates/", { method: "POST", body: data }),
  },
  search: {
    candidates: (q: string) => apiFetch<Candidate[]>(`/api/v1/search/candidates?q=${encodeURIComponent(q)}`),
  },
  conversations: {
    list: () => apiFetch<Conversation[]>("/api/v1/conversations/"),
    get: (id: string) => apiFetch<Conversation>(`/api/v1/conversations/${id}`),
  },
  memory: {
    list: () => apiFetch<Memory[]>("/api/v1/memory/"),
    create: (data: Partial<Memory>) =>
      apiFetch<Memory>("/api/v1/memory/", { method: "POST", body: data }),
  },
  workflows: {
    list: () => apiFetch<Workflow[]>("/api/v1/workflows/"),
    create: (data: Partial<Workflow>) =>
      apiFetch<Workflow>("/api/v1/workflows/", { method: "POST", body: data }),
  },
  embeddings: {
    status: () => apiFetch<EmbeddingStatus>("/api/v1/embeddings/status"),
    generate: (candidateIds: string[]) =>
      apiFetch<{ task_id: string }>("/api/v1/embeddings/generate", {
        method: "POST",
        body: { candidate_ids: candidateIds },
      }),
  },
  provider: {
    status: () => apiFetch<ProviderStatus>("/api/v1/provider/status"),
    health: () => apiFetch<{ status: string }>("/api/v1/health"),
  },
  semanticSearch: {
    search: (params: SemanticSearchParams) =>
      apiFetch<SemanticSearchResult>("/api/v1/search/semantic", {
        method: "POST",
        body: params,
      }),
  },
  memoryContext: {
    getForQuery: (query: string) =>
      apiFetch<Memory[]>(`/api/v1/memory/context?q=${encodeURIComponent(query)}`),
  },
  sourcing: {
    search: (data: {
      query: string;
      sources?: string[];
      limit?: number;
      filters?: Record<string, unknown>;
    }) =>
      apiFetch<SourcingJob>("/api/v1/sourcing/search", {
        method: "POST",
        body: data,
      }),
    getJob: (jobId: string) =>
      apiFetch<SourcingJob>(`/api/v1/sourcing/jobs/${jobId}`),
    listJobs: () =>
      apiFetch<SourcingJob[]>("/api/v1/sourcing/jobs"),
    cancelJob: (jobId: string) =>
      apiFetch<{ status: string }>(`/api/v1/sourcing/jobs/${jobId}/cancel`, {
        method: "POST",
      }),
    getMemory: () =>
      apiFetch<SourcingMemory[]>("/api/v1/sourcing/memory"),
    addMemory: (data: Partial<SourcingMemory>) =>
      apiFetch<SourcingMemory>("/api/v1/sourcing/memory", {
        method: "POST",
        body: data,
      }),
    googleCSE: (data: { query: string; limit?: number }) =>
      apiFetch<{ results: unknown[] }>("/api/v1/sourcing/google-cse", {
        method: "POST",
        body: data,
      }),
    github: (data: Record<string, unknown>) =>
      apiFetch<{ users: unknown[] }>("/api/v1/sourcing/github", {
        method: "POST",
        body: data,
      }),
    resumes: (data: { query: string; skills?: string[]; limit?: number }) =>
      apiFetch<{ resumes: unknown[] }>("/api/v1/sourcing/resumes", {
        method: "POST",
        body: data,
      }),
    normalize: (data: { results: unknown[] }) =>
      apiFetch<{ candidates: unknown[] }>("/api/v1/sourcing/normalize", {
        method: "POST",
        body: data,
      }),
    enrich: (data: { candidate_ids: string[] }) =>
      apiFetch<{ enriched: unknown[] }>("/api/v1/sourcing/enrich", {
        method: "POST",
        body: data,
      }),
  },
  outreach: {
    generate: (data: {
      candidate_id: string;
      channel: string;
      tone: string;
      context?: string;
    }) =>
      apiFetch<OutreachDraft>("/api/v1/outreach/generate", {
        method: "POST",
        body: data,
      }),
    generateSequence: (data: {
      candidate_id: string;
      channels: string[];
    }) =>
      apiFetch<OutreachSequence>("/api/v1/outreach/sequence", {
        method: "POST",
        body: data,
      }),
    list: () => apiFetch<OutreachDraft[]>("/api/v1/outreach/"),
  },
  comparison: {
    analyze: (data: {
      candidate_ids: string[];
      criteria?: Record<string, unknown>;
    }) =>
      apiFetch<CandidateComparison>("/api/v1/comparison/analyze", {
        method: "POST",
        body: data,
      }),
  },
  sessions: {
    list: () => apiFetch<SourcingSession[]>("/api/v1/sessions/"),
    create: (data: { name: string; query: string }) =>
      apiFetch<SourcingSession>("/api/v1/sessions/", {
        method: "POST",
        body: data,
      }),
    get: (id: string) => apiFetch<SourcingSession>(`/api/v1/sessions/${id}`),
    update: (id: string, data: Record<string, unknown>) =>
      apiFetch<SourcingSession>(`/api/v1/sessions/${id}`, {
        method: "PATCH",
        body: data,
      }),
  },
  insights: {
    get: () => apiFetch<RecruiterInsight[]>("/api/v1/insights/"),
    generate: (data: { context: string }) =>
      apiFetch<RecruiterInsight[]>("/api/v1/insights/generate", {
        method: "POST",
        body: data,
      }),
  },
  commandCenter: {
    getData: () => apiFetch<CommandCenterData>("/api/v1/command-center/"),
  },
};

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  company?: string;
  is_active: boolean;
  created_at: string;
}

export interface Candidate {
  id: string;
  full_name: string;
  email?: string;
  current_title?: string;
  current_company?: string;
  location?: string;
  skills: string[];
  experience_years?: number;
  ai_score: number;
  job_stability_score: number;
  response_likelihood: number;
  status: string;
  tags: string[];
  created_at: string;
}

export interface Message {
  id: string;
  role: string;
  content: string;
  model_used?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  title?: string;
  is_active: boolean;
  created_at: string;
  messages: Message[];
}

export interface ChatResponse {
  conversation_id: string;
  message: Message;
  suggestions: string[];
}

export interface Memory {
  id: string;
  memory_type: string;
  category?: string;
  content: string;
  importance: string;
  relevance_score?: number;
  created_at: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: string;
  steps_count: number;
  created_at: string;
}

export interface EmbeddingStatus {
  total_candidates: number;
  embedded_candidates: number;
  last_updated: string;
  model: string;
}

export interface ProviderStatus {
  provider: string;
  model: string;
  status: "healthy" | "degraded" | "unavailable";
  latency_ms?: number;
  last_check: string;
}

export interface SemanticSearchParams {
  query: string;
  limit?: number;
  offset?: number;
  filters?: {
    location?: string;
    min_experience?: number;
    max_experience?: number;
    skills?: string[];
    status?: string;
  };
}

export interface SemanticSearchResult {
  candidates: Candidate[];
  query_embedding?: number[];
  total: number;
  processing_time_ms: number;
}

export interface SourcingJob {
  id: string;
  query: {
    id: string;
    intent: {
      rawQuery: string;
      skills: string[];
      seniority: string;
      location?: string;
      industry?: string;
      experienceMin?: number;
      experienceMax?: number;
      titleKeywords: string[];
      companyKeywords: string[];
      excludeKeywords: string[];
    };
    sources: string[];
    limit: number;
    filters: Record<string, unknown>;
    createdAt: string;
  };
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  sourcesQueried: string[];
  sourcesCompleted: string[];
  sourcesFailed: string[];
  totalResults: number;
  normalizedResults: number;
  enrichedResults: number;
  results: SourcingResult[];
  errors: { source: string; error: string; timestamp: string }[];
  startedAt: string;
  completedAt?: string;
}

export interface SourcingResult {
  id: string;
  fullName: string;
  email?: string;
  currentTitle?: string;
  currentCompany?: string;
  location?: string;
  skills: string[];
  experienceYears?: number;
  source: string;
  sourceUrl?: string;
  matchScore: number;
  matchReasons: string[];
  enrichment?: {
    aiScore: number;
    jobStabilityScore: number;
    responseLikelihood: number;
    companyTier?: string;
    careerTrajectory: string;
  };
}

export interface SourcingMemory {
  id: string;
  memory_type: "preference" | "pattern" | "feedback" | "exclusion";
  content: string;
  category?: string;
  importance: "low" | "medium" | "high";
  source_query?: string;
  created_at: string;
}

export interface OutreachDraft {
  id: string;
  candidate_id: string;
  candidate_name: string;
  channel: string;
  subject?: string;
  body: string;
  tone: string;
  personalizations: string[];
  generated_at: string;
  status: "draft" | "sent" | "scheduled";
}

export interface OutreachSequence {
  id: string;
  name: string;
  candidate_id: string;
  steps: {
    id: string;
    order: number;
    channel: string;
    delay_days: number;
    template: string;
    status: string;
  }[];
  status: string;
  created_at: string;
}

export interface CandidateComparison {
  id: string;
  candidates: {
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
  }[];
  criteria: Record<string, unknown>;
  recommendation: string;
  generated_at: string;
}

export interface SourcingSession {
  id: string;
  name: string;
  query: string;
  status: "active" | "completed" | "paused";
  steps: {
    id: string;
    type: string;
    name: string;
    status: string;
    result?: unknown;
  }[];
  candidates: string[];
  outreach_drafts: string[];
  insights: RecruiterInsight[];
  started_at: string;
  completed_at?: string;
  metrics: {
    candidates_sourced: number;
    candidates_ranked: number;
    outreach_sent: number;
    response_rate: number;
  };
}

export interface RecruiterInsight {
  id: string;
  type: "recommendation" | "warning" | "opportunity" | "pattern" | "metric";
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  actionable: boolean;
  suggested_action?: string;
  related_candidates?: string[];
  generated_at: string;
}

export interface CommandCenterData {
  active_sessions: SourcingSession[];
  recent_activity: {
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }[];
  recommendations: RecruiterInsight[];
  metrics: {
    candidates_sourced_today: number;
    outreach_sent_today: number;
    responses_received: number;
    active_workflows: number;
    avg_response_rate: number;
    top_performing_channel: string;
  };
  workflow_suggestions: {
    id: string;
    name: string;
    description: string;
    type: string;
    estimated_time: string;
    confidence: number;
    steps: string[];
  }[];
}
