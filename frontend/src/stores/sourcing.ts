import { create } from "zustand";
import { api } from "@/lib/api";
import type {
  SourcingIntent,
  SourcingQuery,
  SourcingJob,
  EnrichedCandidate,
  SourcingMemory,
  SourceType,
} from "@/types/sourcing";
import {
  parseSourcingIntent,
  buildSourcingQuery,
  executeSourcingQuery,
} from "@/lib/sourcing-engine";

interface SourcingState {
  // Query state
  currentQuery: string;
  parsedIntent: SourcingIntent | null;
  intentConfidence: number;

  // Job state
  activeJob: SourcingJob | null;
  jobs: SourcingJob[];
  isSearching: boolean;
  searchProgress: Record<string, "started" | "completed" | "failed">;

  // Results
  results: EnrichedCandidate[];
  selectedCandidates: string[];

  // Sources
  selectedSources: SourceType[];

  // Memory
  sourcingMemory: SourcingMemory[];

  // Actions
  setQuery: (query: string) => void;
  parseIntent: () => void;
  setSources: (sources: SourceType[]) => void;
  executeSearch: () => Promise<void>;
  loadJobs: () => Promise<void>;
  selectCandidate: (id: string) => void;
  deselectCandidate: (id: string) => void;
  clearSelection: () => void;
  loadMemory: () => Promise<void>;
  addMemory: (content: string, type: string) => Promise<void>;
  cancelJob: (jobId: string) => Promise<void>;
  reset: () => void;
}

export const useSourcingStore = create<SourcingState>((set, get) => ({
  currentQuery: "",
  parsedIntent: null,
  intentConfidence: 0,
  activeJob: null,
  jobs: [],
  isSearching: false,
  searchProgress: {},
  results: [],
  selectedCandidates: [],
  selectedSources: ["internal_db", "google_cse", "github", "resume_upload"],
  sourcingMemory: [],

  setQuery: (query) => {
    set({ currentQuery: query });
    // Auto-parse intent on query change
    if (query.trim().length > 3) {
      const result = parseSourcingIntent(query);
      set({
        parsedIntent: result.intent,
        intentConfidence: result.confidence,
      });
    } else {
      set({ parsedIntent: null, intentConfidence: 0 });
    }
  },

  parseIntent: () => {
    const query = get().currentQuery;
    if (!query.trim()) return;

    const result = parseSourcingIntent(query);
    set({
      parsedIntent: result.intent,
      intentConfidence: result.confidence,
    });
  },

  setSources: (sources) => set({ selectedSources: sources }),

  executeSearch: async () => {
    const { currentQuery, selectedSources } = get();
    if (!currentQuery.trim()) return;

    set({ isSearching: true, searchProgress: {}, results: [] });

    try {
      // Parse intent
      const intentResult = parseSourcingIntent(currentQuery);
      const query = buildSourcingQuery(
        intentResult.intent,
        selectedSources,
        25
      );

      set({
        parsedIntent: intentResult.intent,
        intentConfidence: intentResult.confidence,
      });

      // Execute search with progress tracking
      const job = await executeSourcingQuery(query, (source, status) => {
        set((state) => ({
          searchProgress: { ...state.searchProgress, [source]: status },
        }));
      });

      set((state) => ({
        activeJob: job,
        jobs: [job, ...state.jobs],
        results: job.results,
        isSearching: false,
      }));

      // Save to memory
      try {
        await api.sourcing.addMemory({
          memory_type: "pattern",
          content: `Searched for: ${currentQuery}`,
          category: "sourcing_query",
          importance: "medium",
          source_query: currentQuery,
        });
      } catch {
        // Non-critical
      }
    } catch (err) {
      set({ isSearching: false });
      throw err;
    }
  },

  loadJobs: async () => {
    try {
      const jobs = await api.sourcing.listJobs();
      set({ jobs: jobs as unknown as SourcingJob[] });
    } catch {
      // Silently fail
    }
  },

  selectCandidate: (id) =>
    set((state) => ({
      selectedCandidates: [...state.selectedCandidates, id],
    })),

  deselectCandidate: (id) =>
    set((state) => ({
      selectedCandidates: state.selectedCandidates.filter((c) => c !== id),
    })),

  clearSelection: () => set({ selectedCandidates: [] }),

  loadMemory: async () => {
    try {
      const memory = await api.sourcing.getMemory();
      set({ sourcingMemory: memory as unknown as SourcingMemory[] });
    } catch {
      // Silently fail
    }
  },

  addMemory: async (content, type) => {
    try {
      const memory = await api.sourcing.addMemory({
        memory_type: type as "preference" | "pattern" | "feedback" | "exclusion",
        content,
        importance: "medium",
      });
      set((state) => ({
        sourcingMemory: [memory as unknown as SourcingMemory, ...state.sourcingMemory],
      }));
    } catch {
      // Silently fail
    }
  },

  cancelJob: async (jobId) => {
    try {
      await api.sourcing.cancelJob(jobId);
      set((state) => ({
        jobs: state.jobs.map((j) =>
          j.id === jobId ? { ...j, status: "cancelled" as const } : j
        ),
        activeJob:
          state.activeJob?.id === jobId
            ? { ...state.activeJob, status: "cancelled" as const }
            : state.activeJob,
      }));
    } catch {
      // Silently fail
    }
  },

  reset: () =>
    set({
      currentQuery: "",
      parsedIntent: null,
      intentConfidence: 0,
      activeJob: null,
      isSearching: false,
      searchProgress: {},
      results: [],
      selectedCandidates: [],
    }),
}));
