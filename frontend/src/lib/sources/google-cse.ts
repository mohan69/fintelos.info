/**
 * Google Custom Search Engine (CSE) Source Connector
 *
 * Searches for candidates via Google CSE targeting professional profiles,
 * resumes, and portfolio sites.
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

export class GoogleCSEConnector implements SourceConnector {
  readonly sourceType: SourceType = "google_cse";

  get isAvailable(): boolean {
    return true; // Backend handles API key availability
  }

  async search(query: SourcingQuery): Promise<RawSourcingResult[]> {
    const searchQueries = this.buildSearchQueries(query);

    const results: RawSourcingResult[] = [];

    for (const searchQuery of searchQueries) {
      try {
        const res = await fetch(`${API_BASE}/api/v1/sourcing/google-cse`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            query: searchQuery,
            limit: query.limit,
            filters: query.filters,
          }),
        });

        if (!res.ok) continue;

        const data = await res.json();

        for (const item of data.results || []) {
          results.push({
            source: "google_cse",
            sourceId: item.link || item.cacheId || `gse-${Date.now()}`,
            sourceUrl: item.link,
            data: {
              title: item.title,
              snippet: item.snippet,
              link: item.link,
              pagemap: item.pagemap,
            },
            fetchedAt: new Date().toISOString(),
          });
        }
      } catch {
        // Continue with other queries
      }
    }

    return results;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/api/v1/sourcing/google-cse/health`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(5000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  private buildSearchQueries(query: SourcingQuery): string[] {
    const { intent } = query;
    const queries: string[] = [];

    // Primary query: skills + title + location
    const parts: string[] = [];

    if (intent.seniority !== "any") {
      parts.push(intent.seniority);
    }

    if (intent.titleKeywords.length > 0) {
      parts.push(intent.titleKeywords.join(" "));
    } else if (intent.skills.length > 0) {
      parts.push(intent.skills.slice(0, 3).join(" "));
    }

    if (intent.location) {
      parts.push(`"${intent.location}"`);
    }

    if (intent.industry) {
      parts.push(intent.industry);
    }

    // Target professional sites
    const sites = [
      "site:linkedin.com/in/",
      "site:github.com",
      "site:stackoverflow.com/users/",
    ];

    if (parts.length > 0) {
      // Query with site restrictions
      for (const site of sites.slice(0, 2)) {
        queries.push(`${parts.join(" ")} ${site}`);
      }

      // Generic professional query
      queries.push(
        `${parts.join(" ")} (resume OR portfolio OR profile) -job -hiring`
      );
    }

    // Skills-focused query
    if (intent.skills.length > 3) {
      queries.push(
        `${intent.skills.slice(0, 5).join(" ")} developer ${intent.location || ""} site:linkedin.com/in/`
      );
    }

    return queries.slice(0, 3); // Limit to 3 queries to avoid rate limits
  }
}

export const googleCSEConnector = new GoogleCSEConnector();
