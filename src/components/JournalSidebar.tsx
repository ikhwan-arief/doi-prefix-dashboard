/**
 * DOI Prefix Publication Dashboard - Journal Sidebar Component
 * Creator: Ikhwan Arief (ikhwan[at]unand.ac.id)
 */

import React, { useMemo, useState } from "react";
import { Search, AlertTriangle, Check, SlidersHorizontal } from "lucide-react";
import type { Article } from "../lib/types";

interface JournalSidebarProps {
  articles: Article[];
  selectedJournal: string;
  onSelectJournal: (journal: string) => void;
}

interface JournalStat {
  name: string;
  count: number;
  suffixTokens: string[];
  doiPrefixes: string[];
  isInconsistent: boolean;
}

export const JournalSidebar: React.FC<JournalSidebarProps> = ({
  articles,
  selectedJournal,
  onSelectJournal,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showInconsistentOnly, setShowInconsistentOnly] = useState(false);

  // Compute stats for each journal
  const journalStats = useMemo<JournalStat[]>(() => {
    const statsMap: Record<string, { count: number; suffixTokens: Set<string>; doiPrefixes: Set<string> }> = {};

    articles.forEach((art) => {
      const jr = art.journal || "Unknown Journal";
      if (!statsMap[jr]) {
        statsMap[jr] = {
          count: 0,
          suffixTokens: new Set<string>(),
          doiPrefixes: new Set<string>(),
        };
      }

      statsMap[jr].count += 1;

      // Extract DOI prefix
      const doi = art.doi || "";
      const slashIdx = doi.indexOf("/");
      if (slashIdx !== -1) {
        const prefix = doi.substring(0, slashIdx);
        statsMap[jr].doiPrefixes.add(prefix);

        const suffix = doi.substring(slashIdx + 1);
        const suffixToken = suffix.split(/[\.\/\-_]/)[0];
        if (suffixToken) {
          statsMap[jr].suffixTokens.add(suffixToken.toLowerCase());
        }
      }
    });

    return Object.entries(statsMap).map(([name, data]) => {
      const suffixTokens = Array.from(data.suffixTokens);
      const doiPrefixes = Array.from(data.doiPrefixes);
      // Inconsistent if multiple suffixes or multiple prefixes are found
      const isInconsistent = suffixTokens.length > 1 || doiPrefixes.length > 1;

      return {
        name,
        count: data.count,
        suffixTokens,
        doiPrefixes,
        isInconsistent,
      };
    }).sort((a, b) => b.count - a.count); // Sorted by article count descending
  }, [articles]);

  // Filter journals based on search query and inconsistent toggle
  const filteredJournals = useMemo(() => {
    return journalStats.filter((jr) => {
      const matchesSearch = jr.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesInconsistent = !showInconsistentOnly || jr.isInconsistent;
      return matchesSearch && matchesInconsistent;
    });
  }, [journalStats, searchQuery, showInconsistentOnly]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col h-[750px] w-full">
      {/* Sidebar Header */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-sky-500" />
            Journals Directory
          </h3>
          <span className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
            {filteredJournals.length} of {journalStats.length}
          </span>
        </div>

        {/* Search Journals */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search journal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-all"
          />
        </div>

        {/* Toggle Show Inconsistent Only */}
        <button
          onClick={() => setShowInconsistentOnly(!showInconsistentOnly)}
          className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
            showInconsistentOnly
              ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400"
              : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <span className="flex items-center gap-2">
            <AlertTriangle className={`h-3.5 w-3.5 ${showInconsistentOnly ? "text-amber-500" : "text-slate-400"}`} />
            Show Inconsistent Only
          </span>
          <span className={`h-2 w-2 rounded-full ${showInconsistentOnly ? "bg-amber-500 animate-pulse" : "bg-slate-350 dark:bg-slate-700"}`}></span>
        </button>
      </div>

      {/* Journal List */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1 scrollbar-thin">
        {filteredJournals.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center p-4 text-xs text-slate-400 dark:text-slate-500">
            No journals found matching the criteria
          </div>
        ) : (
          filteredJournals.map((jr) => {
            const isSelected = selectedJournal === jr.name;
            
            return (
              <div
                key={jr.name}
                onClick={() => onSelectJournal(isSelected ? "" : jr.name)}
                className={`group relative p-3 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col gap-1.5 ${
                  isSelected
                    ? "bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-500/10"
                    : jr.isInconsistent
                    ? "bg-rose-50/50 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/30 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    : "bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                {/* Name & Count Row */}
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-xs font-bold leading-tight line-clamp-2 ${
                      isSelected
                        ? "text-white"
                        : jr.isInconsistent
                        ? "text-rose-600 dark:text-rose-400 font-extrabold"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {jr.name}
                  </span>
                  
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : jr.isInconsistent
                        ? "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-350"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {jr.count}
                  </span>
                </div>

                {/* Suffix Detail Row for Inconsistent */}
                {jr.isInconsistent && (
                  <div
                    className={`text-[10px] p-2 rounded-lg border leading-normal mt-1 flex flex-col gap-1 ${
                      isSelected
                        ? "bg-white/10 border-white/20 text-sky-100"
                        : "bg-rose-50 dark:bg-rose-950/20 border-rose-100/60 dark:border-rose-900/20 text-rose-500 dark:text-rose-450"
                    }`}
                  >
                    <div className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[9px]">
                      <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                      Inconsistent Suffix Pattern
                    </div>
                    {jr.suffixTokens.length > 1 && (
                      <div>
                        <span className="opacity-80">Suffixes:</span>{" "}
                        <code className="font-mono bg-white/40 dark:bg-black/20 px-1 rounded">
                          {jr.suffixTokens.join(", ")}
                        </code>
                      </div>
                    )}
                    {jr.doiPrefixes.length > 1 && (
                      <div>
                        <span className="opacity-80">Prefixes:</span>{" "}
                        <code className="font-mono bg-white/40 dark:bg-black/20 px-1 rounded">
                          {jr.doiPrefixes.join(", ")}
                        </code>
                      </div>
                    )}
                  </div>
                )}

                {/* Selected Checkmark overlay */}
                {isSelected && (
                  <div className="absolute right-2 bottom-2 bg-white/20 rounded-full p-0.5 text-white">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
