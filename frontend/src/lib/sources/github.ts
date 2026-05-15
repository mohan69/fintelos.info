/**
 * GitHub Source Connector
 *
 * Searches for candidate profiles based on GitHub activity,
 * repositories, contributions, and profile data.
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

export class GitHubConnector implements SourceConnector {
  readonly sourceType: SourceType = "github";

  get isAvailable(): boolean {
    return true;
  }

  async search(query: SourcingQuery): Promise<RawSourcingResult[]> {
    const searchParams = this.buildSearchParams(query);

    try {
      const res = await fetch(`${API_BASE}/api/v1/sourcing/github`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(searchParams),
      });

      if (!res.ok) return [];

      const data = await res.json();
      const results: RawSourcingResult[] = [];

      for (const user of data.users || []) {
        results.push({
          source: "github",
          sourceId: `gh-${user.id || user.login}`,
          sourceUrl: user.html_url,
          data: {
            login: user.login,
            name: user.name,
            bio: user.bio,
            company: user.company,
            location: user.location,
            email: user.email,
            public_repos: user.public_repos,
            followers: user.followers,
            following: user.following,
            avatar_url: user.avatar_url,
            blog: user.blog,
            hireable: user.hireable,
            profile: user,
            repos: user.top_repos || [],
            languages: user.top_languages || [],
            contributions: user.contribution_stats || {},
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
      const res = await fetch(`${API_BASE}/api/v1/sourcing/github/health`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(5000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  private buildSearchParams(query: SourcingQuery): Record<string, unknown> {
    const { intent } = query;

    // Build GitHub user search query
    const queryParts: string[] = [];

    if (intent.location) {
      queryParts.push(`location:${intent.location}`);
    }

    if (intent.skills.length > 0) {
      queryParts.push(`language:${intent.skills[0]}`);
    }

    if (intent.titleKeywords.length > 0) {
      queryParts.push(intent.titleKeywords.join(" "));
    }

    // Build repo search for discovering active developers
    const repoQuery = intent.skills.length > 0
      ? intent.skills.slice(0, 3).join(" ") + (intent.industry ? ` ${intent.industry}` : "")
      : intent.titleKeywords.join(" ");

    return {
      user_query: queryParts.join(" "),
      repo_query: repoQuery,
      location: intent.location,
      languages: intent.skills.filter((s) =>
        isProgrammingLanguage(s)
      ),
      min_repos: intent.seniority === "senior" ? 10 : intent.seniority === "lead" ? 20 : 1,
      min_followers: intent.seniority === "senior" ? 50 : intent.seniority === "lead" ? 100 : 0,
      hireable_only: false,
      limit: query.limit,
    };
  }
}

// Common programming languages for filtering
const PROGRAMMING_LANGUAGES = new Set([
  "javascript", "typescript", "python", "java", "go", "rust", "c++",
  "c#", "ruby", "php", "swift", "kotlin", "scala", "r", "matlab",
  "sql", "shell", "bash", "powershell", "perl", "lua", "dart",
  "elixir", "haskell", "clojure", "erlang", "ocaml", "f#",
  "objective-c", "assembly", "cobol", "fortran", "julia", "zig",
]);

function isProgrammingLanguage(skill: string): boolean {
  return PROGRAMMING_LANGUAGES.has(skill.toLowerCase());
}

export const githubConnector = new GitHubConnector();
