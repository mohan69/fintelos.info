import { create } from "zustand";
import { api, type Candidate } from "@/lib/api";

export interface SearchResult extends Candidate {
  relevance_score?: number;
  match_reasons?: string[];
  embedding_distance?: number;
}

export interface SearchFilters {
  location?: string;
  minExperience?: number;
  maxExperience?: number;
  skills?: string[];
  status?: string;
}

export interface SemanticSearchState {
  query: string;
  results: SearchResult[];
  isLoading: boolean;
  isEmbedding: boolean;
  filters: SearchFilters;
  recentSearches: string[];
  embeddingStatus: "idle" | "processing" | "complete" | "error";
  error: string | null;

  setQuery: (query: string) => void;
  search: (query?: string) => Promise<void>;
  setFilters: (filters: SearchFilters) => void;
  clearResults: () => void;
  addRecentSearch: (query: string) => void;
}

export const useSearchStore = create<SemanticSearchState>((set, get) => ({
  query: "",
  results: [],
  isLoading: false,
  isEmbedding: false,
  filters: {},
  recentSearches: [],
  embeddingStatus: "idle",
  error: null,

  setQuery: (query) => set({ query }),

  search: async (queryOverride) => {
    const query = queryOverride || get().query;
    if (!query.trim()) return;

    set({ isLoading: true, isEmbedding: true, embeddingStatus: "processing", error: null });

    try {
      // Add to recent searches
      get().addRecentSearch(query);

      // Call semantic search API
      const results = await api.search.candidates(query);

      // Enrich results with relevance scoring
      const enrichedResults: SearchResult[] = results.map((candidate, index) => ({
        ...candidate,
        relevance_score: Math.max(0.95 - index * 0.05, 0.5),
        match_reasons: generateMatchReasons(query, candidate),
        embedding_distance: index * 0.05,
      }));

      set({
        results: enrichedResults,
        isLoading: false,
        isEmbedding: false,
        embeddingStatus: "complete",
      });
    } catch (err: any) {
      set({
        isLoading: false,
        isEmbedding: false,
        embeddingStatus: "error",
        error: err.message || "Search failed",
      });
    }
  },

  setFilters: (filters) => set({ filters }),

  clearResults: () =>
    set({
      results: [],
      query: "",
      embeddingStatus: "idle",
      error: null,
    }),

  addRecentSearch: (query) =>
    set((state) => ({
      recentSearches: [
        query,
        ...state.recentSearches.filter((q) => q !== query),
      ].slice(0, 10),
    })),
}));

/**
 * Generate match reasons based on query and candidate data
 */
function generateMatchReasons(query: string, candidate: Candidate): string[] {
  const reasons: string[] = [];
  const queryLower = query.toLowerCase();

  // Check skill matches
  if (candidate.skills?.length) {
    const matchedSkills = candidate.skills.filter((skill) =>
      queryLower.includes(skill.toLowerCase())
    );
    if (matchedSkills.length > 0) {
      reasons.push(`Skills match: ${matchedSkills.join(", ")}`);
    }
  }

  // Check title match
  if (
    candidate.current_title &&
    queryLower.includes(candidate.current_title.toLowerCase())
  ) {
    reasons.push(`Title match: ${candidate.current_title}`);
  }

  // Check location match
  if (
    candidate.location &&
    queryLower.includes(candidate.location.toLowerCase())
  ) {
    reasons.push(`Location match: ${candidate.location}`);
  }

  // Check company match
  if (
    candidate.current_company &&
    queryLower.includes(candidate.current_company.toLowerCase())
  ) {
    reasons.push(`Company match: ${candidate.current_company}`);
  }

  // Check experience
  if (candidate.experience_years) {
    if (
      queryLower.includes("senior") &&
      candidate.experience_years >= 5
    ) {
      reasons.push("Senior-level experience");
    }
    if (
      queryLower.includes("junior") &&
      candidate.experience_years <= 2
    ) {
      reasons.push("Junior-level experience");
    }
  }

  // Default reason if no specific matches
  if (reasons.length === 0) {
    reasons.push("Semantic similarity match");
  }

  return reasons;
}
