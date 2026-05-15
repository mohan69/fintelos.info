"use client";

import { useState, useEffect } from "react";
import { useChatStore } from "@/stores/chat";
import type { AIProviderId } from "@/lib/ai-provider";
import {
  Brain,
  Zap,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PROVIDERS: {
  id: AIProviderId;
  name: string;
  model: string;
  icon: typeof Brain;
}[] = [
  { id: "mimo", name: "Mimo v2.5 Pro", model: "mimo-v2.5-pro", icon: Zap },
  {
    id: "openai",
    name: "OpenAI",
    model: "gpt-4o-mini",
    icon: Brain,
  },
  {
    id: "anthropic",
    name: "Anthropic",
    model: "claude-3-5-sonnet",
    icon: Brain,
  },
];

export function ProviderStatus() {
  const { activeProvider, activeModel, setProvider } = useChatStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isHealthy, setIsHealthy] = useState(true);

  useEffect(() => {
    // Check provider health periodically
    const checkHealth = async () => {
      try {
        const API_BASE =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;
        const res = await fetch(`${API_BASE}/api/v1/health`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: AbortSignal.timeout(5000),
        });
        setIsHealthy(res.ok);
      } catch {
        setIsHealthy(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  const activeProviderInfo = PROVIDERS.find((p) => p.id === activeProvider);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
          isHealthy
            ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
            : "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
        )}
      >
        {isHealthy ? (
          <CheckCircle2 className="w-3 h-3" />
        ) : (
          <AlertCircle className="w-3 h-3" />
        )}
        <span>{activeProviderInfo?.name || "AI"}</span>
        <span className="text-[10px] opacity-60">{activeModel}</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 z-50 w-64 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg overflow-hidden">
            <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                AI Provider
              </p>
            </div>
            <div className="p-1">
              {PROVIDERS.map((provider) => {
                const Icon = provider.icon;
                const isActive = provider.id === activeProvider;
                return (
                  <button
                    key={provider.id}
                    onClick={() => {
                      setProvider(provider.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left text-sm transition-colors",
                      isActive
                        ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        isActive
                          ? "text-indigo-500"
                          : "text-zinc-400"
                      )}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{provider.name}</p>
                      <p className="text-[10px] text-zinc-500">
                        {provider.model}
                      </p>
                    </div>
                    {isActive && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    isHealthy ? "bg-emerald-500" : "bg-amber-500"
                  )}
                />
                <span className="text-xs text-zinc-500">
                  {isHealthy ? "Backend connected" : "Backend unavailable"}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
