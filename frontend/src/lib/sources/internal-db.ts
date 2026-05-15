/**
 * Internal Database Source Connector
 *
 * Searches the existing candidate database within the Fintelos system.
 * Uses semantic search and traditional filtering.
 */

import type {
  SourceConnector,
  SourceType,
  SourcingQuery,
  RawSourcingResult,
} from "@/types/sourcing";
import { api } from "@/lib/api";

export class InternalDBConnector implements SourceConnector {
  readonly sourceType: SourceType = "internal_db";

  get isAvailable(): boolean {
    return true;
  }

  async search(query: SourcingQuery): Promise<RawSourcingResult[]> {
    const { intent, filters, limit } = query;

    try {
      // Build search query from intent
      const searchTerms = [
        ...intent.titleKeywords,
        ...intent.skills.slice(0, 5),
        intent.location || "",
        intent.industry || "",
      ].filter(Boolean);

      const searchQuery = searchTerms.join(" ");

      // Use semantic search if available, fallback to regular search
      let candidates;
      try {
        const semanticResult = await api.semanticSearch.search({
          query: searchQuery,
          limit,
          filters: {
            location: filters.location || intent.location,
            min_experience: filters.minExperience || intent.experienceMin,
            max_experience: filters.maxExperience || intent.experienceMax,
            skills: filters.skills || intent.skills,
          },
        });
        candidates = semanticResult.candidates;
      } catch {
        candidates = await api.search.candidates(searchQuery);
      }

      return candidates.map((candidate) => ({
        source: "internal_db" as SourceType,
        sourceId: `db-${candidate.id}`,
        sourceUrl: `/candidates/${candidate.id}`,
        data: {
          ...candidate,
          _source: "internal_db",
        },
        fetchedAt: new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await api.candidates.list();
      return true;
    } catch {
      return false;
    }
  }
}

export const internalDBConnector = new InternalDBConnector();
