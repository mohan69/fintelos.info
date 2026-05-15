import { create } from "zustand";
import { api } from "@/lib/api";
import type {
  SourcingSession,
  OutreachDraft,
  OutreachSequence,
  CandidateComparison,
  RecruiterInsight,
  WorkflowSuggestion,
  CommandCenterData,
  OutreachChannel,
  OutreachTone,
} from "@/types/workflows";
import type { Candidate, Memory } from "@/lib/api";
import {
  executeSourcingWorkflow,
  executeOutreachWorkflow,
  executeComparisonWorkflow,
  generateNextBestActions,
} from "@/lib/workflow-engine";
import {
  generateOutreach,
  generateOutreachSequence,
} from "@/lib/outreach-engine";

interface WorkflowState {
  // Sessions
  activeSession: SourcingSession | null;
  sessions: SourcingSession[];
  isExecuting: boolean;

  // Outreach
  outreachDrafts: OutreachDraft[];
  activeSequence: OutreachSequence | null;
  isGeneratingOutreach: boolean;

  // Comparison
  activeComparison: CandidateComparison | null;
  isComparing: boolean;

  // Insights
  insights: RecruiterInsight[];
  suggestions: WorkflowSuggestion[];

  // Command center
  commandCenterData: CommandCenterData | null;

  // Actions
  executeWorkflow: (query: string) => Promise<void>;
  loadSessions: () => Promise<void>;
  selectSession: (id: string) => void;

  generateOutreach: (
    candidate: Candidate,
    channel: OutreachChannel,
    tone: OutreachTone,
    context?: string
  ) => Promise<OutreachDraft>;

  generateSequence: (
    candidate: Candidate,
    channels: OutreachChannel[]
  ) => Promise<void>;

  executeBatchOutreach: (
    candidates: Candidate[],
    channel: OutreachChannel
  ) => Promise<void>;

  compareCandidates: (candidates: Candidate[]) => Promise<void>;

  loadInsights: () => Promise<void>;
  loadCommandCenter: () => Promise<void>;
  loadSuggestions: () => void;

  clearActiveSession: () => void;
  clearComparison: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  activeSession: null,
  sessions: [],
  isExecuting: false,

  outreachDrafts: [],
  activeSequence: null,
  isGeneratingOutreach: false,

  activeComparison: null,
  isComparing: false,

  insights: [],
  suggestions: [],

  commandCenterData: null,

  executeWorkflow: async (query) => {
    set({ isExecuting: true, activeSession: null });

    try {
      const session = await executeSourcingWorkflow(query, (step) => {
        // Update session with step progress
        set((state) => ({
          activeSession: state.activeSession
            ? {
                ...state.activeSession,
                steps: state.activeSession.steps.map((s) =>
                  s.id === step.id ? step : s
                ),
              }
            : null,
        }));
      });

      // Generate next-best-action suggestions
      const suggestions = generateNextBestActions(session, [], []);

      set((state) => ({
        activeSession: session,
        sessions: [session, ...state.sessions],
        insights: [...state.insights, ...session.insights],
        suggestions,
        isExecuting: false,
      }));

      // Save session to backend
      try {
        await api.sessions.create({
          name: session.name,
          query: session.query,
        });
      } catch {
        // Non-critical
      }
    } catch (err) {
      set({ isExecuting: false });
      throw err;
    }
  },

  loadSessions: async () => {
    try {
      const sessions = await api.sessions.list();
      set({ sessions: sessions as unknown as SourcingSession[] });
    } catch {
      // Silently fail
    }
  },

  selectSession: (id) => {
    const session = get().sessions.find((s) => s.id === id);
    if (session) {
      set({ activeSession: session });
    }
  },

  generateOutreach: async (candidate, channel, tone, context) => {
    set({ isGeneratingOutreach: true });

    try {
      const memoryContext = await api.memoryContext
        .getForQuery(candidate.full_name)
        .catch(() => []);

      const draft = await generateOutreach(
        candidate,
        channel,
        tone,
        memoryContext,
        context
      );

      set((state) => ({
        outreachDrafts: [draft, ...state.outreachDrafts],
        isGeneratingOutreach: false,
      }));

      return draft;
    } catch (err) {
      set({ isGeneratingOutreach: false });
      throw err;
    }
  },

  generateSequence: async (candidate, channels) => {
    set({ isGeneratingOutreach: true });

    try {
      const memoryContext = await api.memoryContext
        .getForQuery(candidate.full_name)
        .catch(() => []);

      const sequence = await generateOutreachSequence(
        candidate,
        channels,
        memoryContext
      );

      set({
        activeSequence: sequence,
        isGeneratingOutreach: false,
      });
    } catch (err) {
      set({ isGeneratingOutreach: false });
      throw err;
    }
  },

  executeBatchOutreach: async (candidates, channel) => {
    set({ isGeneratingOutreach: true });

    try {
      const memoryContext = await api.memoryContext
        .getForQuery(candidates.map((c) => c.full_name).join(" "))
        .catch(() => []);

      const { drafts, insights } = await executeOutreachWorkflow(
        candidates,
        channel,
        memoryContext
      );

      set((state) => ({
        outreachDrafts: [...drafts, ...state.outreachDrafts],
        insights: [...state.insights, ...insights],
        isGeneratingOutreach: false,
      }));
    } catch (err) {
      set({ isGeneratingOutreach: false });
      throw err;
    }
  },

  compareCandidates: async (candidates) => {
    set({ isComparing: true, activeComparison: null });

    try {
      const comparison = await executeComparisonWorkflow(candidates);

      set({
        activeComparison: comparison as unknown as CandidateComparison,
        isComparing: false,
      });
    } catch (err) {
      set({ isComparing: false });
      throw err;
    }
  },

  loadInsights: async () => {
    try {
      const insights = await api.insights.get();
      set({ insights: insights as unknown as RecruiterInsight[] });
    } catch {
      // Silently fail
    }
  },

  loadCommandCenter: async () => {
    try {
      const data = await api.commandCenter.getData();
      set({ commandCenterData: data as unknown as CommandCenterData });
    } catch {
      // Generate local command center data
      const { sessions, insights, outreachDrafts } = get();
      const activeSessions = sessions.filter((s) => s.status === "active");

      set({
        commandCenterData: {
          active_sessions: activeSessions as unknown as CommandCenterData["active_sessions"],
          recent_activity: generateRecentActivity(sessions, outreachDrafts),
          recommendations: insights.filter((i) => i.actionable),
          metrics: {
            candidates_sourced_today: sessions.reduce(
              (sum, s) => sum + (s.metrics?.candidates_sourced || 0),
              0
            ),
            outreach_sent_today: outreachDrafts.filter(
              (d) => d.status === "sent"
            ).length,
            responses_received: 0,
            active_workflows: activeSessions.length,
            avg_response_rate: 0,
            top_performing_channel: "email",
          },
          workflow_suggestions: get().suggestions as unknown as CommandCenterData["workflow_suggestions"],
        },
      });
    }
  },

  loadSuggestions: () => {
    const { activeSession, sessions, outreachDrafts } = get();

    if (activeSession) {
      const suggestions = generateNextBestActions(
        activeSession,
        [],
        []
      );
      set({ suggestions });
    } else if (sessions.length > 0) {
      // Generate suggestions based on recent sessions
      const recentSession = sessions[0];
      const suggestions = generateNextBestActions(
        recentSession,
        [],
        []
      );
      set({ suggestions });
    }
  },

  clearActiveSession: () => set({ activeSession: null }),
  clearComparison: () => set({ activeComparison: null }),
}));

function generateRecentActivity(
  sessions: SourcingSession[],
  outreachDrafts: OutreachDraft[]
): CommandCenterData["recent_activity"] {
  const activities: CommandCenterData["recent_activity"] = [];

  for (const session of sessions.slice(0, 5)) {
    activities.push({
      id: `activity-session-${session.id}`,
      type: "sourcing",
      description: `Sourcing session: ${session.name}`,
      timestamp: session.started_at,
    });
  }

  for (const draft of outreachDrafts.slice(0, 5)) {
    activities.push({
      id: `activity-outreach-${draft.id}`,
      type: "outreach",
      description: `Outreach to ${draft.candidateName} via ${draft.channel}`,
      timestamp: draft.generatedAt,
    });
  }

  return activities
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 10);
}
