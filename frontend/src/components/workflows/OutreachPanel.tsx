"use client";

import { useState } from "react";
import { useWorkflowStore } from "@/stores/workflow";
import type { Candidate } from "@/lib/api";
import type { OutreachChannel, OutreachTone, OutreachDraft } from "@/types/workflows";
import { cn } from "@/lib/utils";
import {
  Send,
  Mail,
  MessageSquare,
  Phone,
  Loader2,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";

interface OutreachPanelProps {
  candidates: Candidate[];
  onClose?: () => void;
}

const CHANNELS: { id: OutreachChannel; label: string; icon: typeof Mail }[] = [
  { id: "email", label: "Email", icon: Mail },
  { id: "linkedin", label: "LinkedIn", icon: MessageSquare },
  { id: "whatsapp", label: "WhatsApp", icon: Phone },
];

const TONES: { id: OutreachTone; label: string }[] = [
  { id: "professional", label: "Professional" },
  { id: "friendly", label: "Friendly" },
  { id: "casual", label: "Casual" },
  { id: "formal", label: "Formal" },
];

export function OutreachPanel({ candidates, onClose }: OutreachPanelProps) {
  const { generateOutreach, outreachDrafts, isGeneratingOutreach } =
    useWorkflowStore();
  const [selectedChannel, setSelectedChannel] = useState<OutreachChannel>("email");
  const [selectedTone, setSelectedTone] = useState<OutreachTone>("professional");
  const [generatedDrafts, setGeneratedDrafts] = useState<OutreachDraft[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleGenerate = async () => {
    const drafts: OutreachDraft[] = [];

    for (const candidate of candidates.slice(0, 3)) {
      try {
        const draft = await generateOutreach(
          candidate,
          selectedChannel,
          selectedTone
        );
        drafts.push(draft);
      } catch {
        // Continue with other candidates
      }
    }

    setGeneratedDrafts(drafts);
  };

  const handleCopy = (draft: OutreachDraft) => {
    const text = draft.subject
      ? `Subject: ${draft.subject}\n\n${draft.body}`
      : draft.body;

    navigator.clipboard.writeText(text);
    setCopiedId(draft.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-semibold">AI Outreach Generator</h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-xs text-zinc-500 hover:text-zinc-700"
            >
              Close
            </button>
          )}
        </div>

        <p className="text-xs text-zinc-500 mb-3">
          Generating outreach for {candidates.length} candidate
          {candidates.length > 1 ? "s" : ""}
        </p>

        {/* Channel selection */}
        <div className="flex gap-2 mb-3">
          {CHANNELS.map((channel) => {
            const Icon = channel.icon;
            return (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  selectedChannel === channel.id
                    ? "bg-indigo-500 text-white"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
                )}
              >
                <Icon className="w-3 h-3" />
                {channel.label}
              </button>
            );
          })}
        </div>

        {/* Tone selection */}
        <div className="flex gap-2 mb-3">
          {TONES.map((tone) => (
            <button
              key={tone.id}
              onClick={() => setSelectedTone(tone.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                selectedTone === tone.id
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
              )}
            >
              {tone.label}
            </button>
          ))}
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={isGeneratingOutreach || candidates.length === 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors"
        >
          {isGeneratingOutreach ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Generate Outreach
        </button>
      </div>

      {/* Generated drafts */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {generatedDrafts.length > 0 ? (
          generatedDrafts.map((draft) => (
            <DraftCard
              key={draft.id}
              draft={draft}
              copied={copiedId === draft.id}
              onCopy={() => handleCopy(draft)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500">
            <Send className="w-8 h-8 mb-3 text-zinc-400" />
            <p className="text-sm">No drafts generated yet</p>
            <p className="text-xs text-zinc-400 mt-1">
              Select candidates and click Generate
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DraftCard({
  draft,
  copied,
  onCopy,
}: {
  draft: OutreachDraft;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm font-medium">{draft.candidateName}</p>
          <p className="text-xs text-zinc-400 capitalize">{draft.channel}</p>
        </div>
        <button
          onClick={onCopy}
          className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-zinc-400" />
          )}
        </button>
      </div>

      {draft.subject && (
        <p className="text-xs font-medium mb-1">Subject: {draft.subject}</p>
      )}

      <p className="text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
        {draft.body}
      </p>

      {draft.personalizations.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {draft.personalizations.map((p, i) => (
            <span
              key={i}
              className="px-1.5 py-0.5 text-[10px] rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
            >
              {p}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
