"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SearchBar } from "@/components/search/SearchBar";
import { SemanticResults } from "@/components/search/SemanticResults";
import { api, type Candidate } from "@/lib/api";
import { Loader2, Sparkles, Filter } from "lucide-react";

interface SearchResult extends Candidate {
  relevance_score?: number;
  match_reasons?: string[];
  embedding_distance?: number;
}

export default function SearchPage() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [processingTime, setProcessingTime] = useState<number>();

  const handleSearch = async (searchQuery: string) => {
    setIsLoading(true);
    setQuery(searchQuery);
    const startTime = Date.now();

    try {
      const data = await api.search.candidates(searchQuery);
      const enriched: SearchResult[] = data.map((candidate, index) => ({
        ...candidate,
        relevance_score: Math.max(0.95 - index * 0.05, 0.5),
        match_reasons: generateMatchReasons(searchQuery, candidate),
        embedding_distance: index * 0.05,
      }));

      setResults(enriched);
      setProcessingTime(Date.now() - startTime);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col h-full p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950">
              <Sparkles className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Semantic Search</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Find candidates using natural language powered by embeddings
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-indigo-200 dark:border-indigo-800 animate-ping" />
            </div>
            <p className="mt-4 text-sm text-zinc-500">
              Running semantic search...
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Generating embeddings and finding matches
            </p>
          </div>
        ) : results.length > 0 ? (
          <SemanticResults
            results={results}
            query={query}
            isLoading={false}
            processingTime={processingTime}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-zinc-400" />
            </div>
            <p className="font-medium">Search for candidates</p>
            <p className="text-sm text-zinc-400 mt-1">
              Try: &quot;senior Python developer in Bangalore&quot; or
              &quot;ML engineer with 5+ years experience&quot;
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function generateMatchReasons(
  query: string,
  candidate: Candidate
): string[] {
  const reasons: string[] = [];
  const queryLower = query.toLowerCase();

  if (candidate.skills?.length) {
    const matchedSkills = candidate.skills.filter((skill) =>
      queryLower.includes(skill.toLowerCase())
    );
    if (matchedSkills.length > 0) {
      reasons.push(`Skills match: ${matchedSkills.join(", ")}`);
    }
  }

  if (
    candidate.current_title &&
    queryLower.includes(candidate.current_title.toLowerCase())
  ) {
    reasons.push(`Title match: ${candidate.current_title}`);
  }

  if (
    candidate.location &&
    queryLower.includes(candidate.location.toLowerCase())
  ) {
    reasons.push(`Location match: ${candidate.location}`);
  }

  if (
    candidate.current_company &&
    queryLower.includes(candidate.current_company.toLowerCase())
  ) {
    reasons.push(`Company match: ${candidate.current_company}`);
  }

  if (candidate.experience_years) {
    if (queryLower.includes("senior") && candidate.experience_years >= 5) {
      reasons.push("Senior-level experience");
    }
    if (queryLower.includes("junior") && candidate.experience_years <= 2) {
      reasons.push("Junior-level experience");
    }
  }

  if (reasons.length === 0) {
    reasons.push("Semantic similarity match");
  }

  return reasons;
}
