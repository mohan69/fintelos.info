"use client";

import { useState, type KeyboardEvent } from "react";
import { Search, Loader2 } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function SearchBar({ onSearch, isLoading, placeholder = "Search candidates by skill, title, location..." }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim()) onSearch(query.trim());
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="flex items-center gap-2 w-full max-w-2xl">
      <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus-within:ring-2 focus-within:ring-indigo-500">
        <Search className="w-5 h-5 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-zinc-400"
        />
      </div>
      <button
        onClick={handleSearch}
        disabled={!query.trim() || isLoading}
        className="px-4 py-3 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors"
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
      </button>
    </div>
  );
}
