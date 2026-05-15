"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import { useSourcingStore } from "@/stores/sourcing";
import { Search, Loader2, Sparkles, X } from "lucide-react";

export function SourcingQueryInput() {
  const { currentQuery, setQuery, executeSearch, isSearching } =
    useSourcingStore();
  const [localQuery, setLocalQuery] = useState(currentQuery);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSearch = () => {
    if (!localQuery.trim() || isSearching) return;
    setQuery(localQuery.trim());
    executeSearch();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleClear = () => {
    setLocalQuery("");
    setQuery("");
    inputRef.current?.focus();
  };

  const exampleQueries = [
    "Find Java architects in Bangalore with banking experience",
    "Senior Python developers with ML experience",
    "React engineers at top tech companies, 5+ years",
    "DevOps engineers in remote, Kubernetes expertise",
  ];

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="flex items-start gap-3 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
          <Sparkles className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
          <textarea
            ref={inputRef}
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the candidate you're looking for..."
            rows={2}
            className="flex-1 text-sm bg-transparent focus:outline-none resize-none placeholder:text-zinc-400"
          />
          <div className="flex items-center gap-2 shrink-0">
            {localQuery && (
              <button
                onClick={handleClear}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleSearch}
              disabled={!localQuery.trim() || isSearching}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Source
            </button>
          </div>
        </div>
      </div>

      {/* Example queries */}
      <div className="flex flex-wrap gap-2">
        {exampleQueries.map((q) => (
          <button
            key={q}
            onClick={() => {
              setLocalQuery(q);
              setQuery(q);
            }}
            className="px-3 py-1.5 text-xs rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
