/**
 * Resume Search Source Connector
 *
 * Searches uploaded resumes in the system using semantic matching.
 */

import type {
  SourceConnector,
  SourceType,
  SourcingQuery,
  RawSourcingResult,
} from "@/types/sourcing";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

function getAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export class ResumeSearchConnector implements SourceConnector {
  readonly sourceType: SourceType = "resume_upload";

  get isAvailable(): boolean {
    return true;
  }

  async search(query: SourcingQuery): Promise<RawSourcingResult[]> {
    const { intent, limit } = query;

    try {
      const res = await fetch(`${API_BASE}/api/v1/sourcing/resumes`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          query: intent.rawQuery,
          skills: intent.skills,
          titles: intent.titleKeywords,
          location: intent.location,
          limit,
        }),
      });

      if (!res.ok) return [];

      const data = await res.json();
      const results: RawSourcingResult[] = [];

      for (const resume of data.resumes || []) {
        results.push({
          source: "resume_upload",
          sourceId: `resume-${resume.id}`,
          sourceUrl: resume.file_url,
          data: {
            ...resume,
            _source: "resume_upload",
          },
          fetchedAt: new Date().toISOString(),
        });
      }

      return results;
    } catch {
      return [];
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/api/v1/sourcing/resumes/health`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(5000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const resumeSearchConnector = new ResumeSearchConnector();
