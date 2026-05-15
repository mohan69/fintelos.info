"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { api, type Memory } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Plus,
  Brain,
  Sparkles,
  Tag,
  Clock,
  Star,
  Lightbulb,
  TrendingUp,
  Filter,
} from "lucide-react";

type FilterType = "all" | "preference" | "pattern" | "feedback";

const DEMO_MEMORIES: Memory[] = [
  {
    id: "mem-1",
    memory_type: "preference",
    category: "sourcing",
    content: "Prefers candidates from product-based companies over service companies. Values hands-on coding experience over certifications.",
    importance: "high",
    relevance_score: 0.95,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "mem-2",
    memory_type: "pattern",
    category: "outreach",
    content: "LinkedIn InMail has 42% higher response rate than cold email for senior candidates. Personalized messages referencing specific projects perform best.",
    importance: "high",
    relevance_score: 0.88,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "mem-3",
    memory_type: "preference",
    category: "candidates",
    content: "Looking for Python developers with strong system design skills. Microservices architecture experience is a plus. Prefers candidates who have worked at scale.",
    importance: "medium",
    relevance_score: 0.82,
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: "mem-4",
    memory_type: "feedback",
    category: "sourcing",
    content: "GitHub profile quality is a strong indicator of technical ability. Look for consistent contribution history and well-documented projects.",
    importance: "medium",
    relevance_score: 0.75,
    created_at: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    id: "mem-5",
    memory_type: "pattern",
    category: "candidates",
    content: "Candidates with 3-5 years experience at top-tier startups tend to have the best ramp-up time. FAANG experience is valuable but not a dealbreaker.",
    importance: "medium",
    relevance_score: 0.7,
    created_at: new Date(Date.now() - 432000000).toISOString(),
  },
];

export default function MemoryPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const loadMemories = async () => {
    try {
      const data = await api.memory.list();
      setMemories(data.length > 0 ? data : DEMO_MEMORIES);
    } catch {
      setMemories(DEMO_MEMORIES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMemories(); // eslint-disable-line react-hooks/set-state-in-effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredMemories = activeFilter === "all"
    ? memories
    : memories.filter((m) => m.memory_type === activeFilter);

  const typeColors: Record<string, { bg: string; text: string; border: string }> = {
    preference: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" },
    pattern: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
    feedback: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
    exclusion: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
  };

  const typeIcons: Record<string, typeof Brain> = {
    preference: Star,
    pattern: TrendingUp,
    feedback: Lightbulb,
    exclusion: Filter,
  };

  const filters: { id: FilterType; label: string }[] = [
    { id: "all", label: "All" },
    { id: "preference", label: "Preferences" },
    { id: "pattern", label: "Patterns" },
    { id: "feedback", label: "Feedback" },
  ];

  return (
    <AppShell>
      <div className="flex flex-col h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full px-6 py-8 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20">
                  <Brain className="w-5 h-5 text-indigo-400" />
                </div>
                <h1 className="text-2xl font-semibold gradient-text">Recruiter Memory</h1>
              </div>
              <p className="text-sm text-muted">
                AI learns your preferences, patterns, and feedback to improve over time
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-medium shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-shadow"
            >
              <Plus className="w-4 h-4" />
              Add Memory
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {[
              { label: "Total Memories", value: memories.length, icon: Brain },
              { label: "Preferences", value: memories.filter(m => m.memory_type === "preference").length, icon: Star },
              { label: "Patterns", value: memories.filter(m => m.memory_type === "pattern").length, icon: TrendingUp },
              { label: "Feedback", value: memories.filter(m => m.memory_type === "feedback").length, icon: Lightbulb },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  className="p-4 rounded-xl border border-border bg-surface text-center"
                >
                  <Icon className="w-4 h-4 text-muted mx-auto mb-1" />
                  <p className="text-xl font-semibold text-foreground">{stat.value}</p>
                  <p className="text-[10px] text-muted">{stat.label}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-1 p-1 rounded-xl bg-surface-hover border border-border w-fit"
          >
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  activeFilter === filter.id
                    ? "bg-surface text-foreground shadow-sm border border-border"
                    : "text-muted hover:text-foreground"
                )}
              >
                {filter.label}
              </button>
            ))}
          </motion.div>

          {/* Memory List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : filteredMemories.length > 0 ? (
            <AnimatePresence mode="popLayout">
              <div className="space-y-3">
                {filteredMemories.map((memory, i) => {
                  const colors = typeColors[memory.memory_type] || typeColors.preference;
                  const Icon = typeIcons[memory.memory_type] || Brain;

                  return (
                    <motion.div
                      key={memory.id}
                      layout
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: i * 0.04, ease: [0.4, 0, 0.2, 1] }}
                      whileHover={{ y: -2 }}
                      className="p-4 rounded-xl border border-border bg-surface hover:shadow-lg hover:shadow-indigo-500/5 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn("p-2 rounded-lg border shrink-0", colors.bg, colors.border)}>
                          <Icon className={cn("w-4 h-4", colors.text)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={cn(
                              "text-[10px] font-medium px-2 py-0.5 rounded-full capitalize",
                              colors.bg, colors.text
                            )}>
                              {memory.memory_type}
                            </span>
                            {memory.category && (
                              <span className="flex items-center gap-1 text-[10px] text-muted">
                                <Tag className="w-2.5 h-2.5" />
                                {memory.category}
                              </span>
                            )}
                            <span className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded-full",
                              memory.importance === "high"
                                ? "bg-amber-500/10 text-amber-400"
                                : memory.importance === "medium"
                                  ? "bg-surface-hover text-muted"
                                  : "bg-surface-hover text-muted/60"
                            )}>
                              {memory.importance}
                            </span>
                          </div>
                          <p className="text-sm text-foreground leading-relaxed">{memory.content}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="flex items-center gap-1 text-[10px] text-muted/60">
                              <Clock className="w-2.5 h-2.5" />
                              {new Date(memory.created_at).toLocaleDateString()}
                            </span>
                            {memory.relevance_score && (
                              <span className="flex items-center gap-1 text-[10px] text-muted/60">
                                <Sparkles className="w-2.5 h-2.5" />
                                {Math.round(memory.relevance_score * 100)}% relevance
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-muted"
            >
              <div className="w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-muted/50" />
              </div>
              <p className="font-medium">No memories found</p>
              <p className="text-sm text-muted/60 mt-1">
                {activeFilter !== "all"
                  ? `No ${activeFilter} memories yet`
                  : "The AI will learn your preferences over time"}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
