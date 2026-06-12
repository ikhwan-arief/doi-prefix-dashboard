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
    <div className="bg-seline-white border border-seline-pearl-border rounded-seline-cards p-4 shadow-seline-sm flex flex-col h-[750px] w-full">
      {/* Sidebar Header */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-display font-medium text-seline-ink flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-seline-blue" />
            Journals Directory
          </h3>
          <span className="text-[11px] font-medium bg-seline-cream text-seline-slate px-2 py-0.5 rounded-full border border-seline-pearl-border">
            {filteredJournals.length} of {journalStats.length}
          </span>
        </div>

        {/* Search Journals */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-seline-soft-slate" />
          <input
            type="text"
            placeholder="Search journal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-seline-inputs border border-seline-warm-border bg-seline-white text-seline-ink placeholder-seline-soft-slate focus:outline-none focus:border-seline-blue focus:ring-1 focus:ring-seline-blue transition-all h-[36px]"
          />
        </div>

        {/* Toggle Show Inconsistent Only */}
        <button
          onClick={() => setShowInconsistentOnly(!showInconsistentOnly)}
          className={`w-full flex items-center justify-between p-2.5 rounded-seline-inputs border text-xs font-medium transition-all cursor-pointer ${
            showInconsistentOnly
              ? "bg-seline-wash border-seline-blue text-seline-ink"
              : "bg-seline-white border-seline-warm-border text-seline-slate hover:bg-seline-cream"
          }`}
        >
          <span className="flex items-center gap-2">
            <AlertTriangle className={`h-3.5 w-3.5 ${showInconsistentOnly ? "text-seline-blue" : "text-seline-soft-slate"}`} />
            Show Inconsistent Only
          </span>
          <span className={`h-2 w-2 rounded-full ${showInconsistentOnly ? "bg-seline-blue animate-pulse" : "bg-seline-mist-gray"}`}></span>
        </button>
      </div>

      {/* Journal List */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1 scrollbar-thin">
        {filteredJournals.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center p-4 text-xs text-seline-slate">
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
                    ? "bg-seline-blue text-seline-white border-seline-blue shadow-seline-sm"
                    : jr.isInconsistent
                    ? "bg-seline-cream border-seline-warm-border hover:bg-seline-wash/10"
                    : "bg-seline-white border-seline-pearl-border hover:bg-seline-cream"
                }`}
              >
                {/* Name & Count Row */}
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-xs font-medium leading-tight line-clamp-2 ${
                      isSelected
                        ? "text-seline-white"
                        : jr.isInconsistent
                        ? "text-seline-ink font-semibold"
                        : "text-seline-ink"
                    }`}
                  >
                    {jr.name}
                  </span>
                  
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                      isSelected
                        ? "bg-seline-white/20 text-seline-white"
                        : jr.isInconsistent
                        ? "bg-seline-white border border-seline-warm-border text-seline-slate"
                        : "bg-seline-cream border border-seline-pearl-border text-seline-slate"
                    }`}
                  >
                    {jr.count}
                  </span>
                </div>

                {/* Suffix Detail Row for Inconsistent */}
                {jr.isInconsistent && (
                  <div
                    className={`text-[10px] p-2 rounded-md border leading-normal mt-1 flex flex-col gap-1 ${
                      isSelected
                        ? "bg-seline-white/10 border-white/20 text-seline-white"
                        : "bg-seline-white border-seline-pearl-border text-seline-slate"
                    }`}
                  >
                    <div className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[9px] text-seline-blue">
                      <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                      Inconsistent Suffix Pattern
                    </div>
                    {jr.suffixTokens.length > 1 && (
                      <div>
                        <span className="opacity-80">Suffixes:</span>{" "}
                        <code className={`font-mono px-1 rounded ${isSelected ? "bg-white/20" : "bg-seline-cream"}`}>
                          {jr.suffixTokens.join(", ")}
                        </code>
                      </div>
                    )}
                    {jr.doiPrefixes.length > 1 && (
                      <div>
                        <span className="opacity-80">Prefixes:</span>{" "}
                        <code className={`font-mono px-1 rounded ${isSelected ? "bg-white/20" : "bg-seline-cream"}`}>
                          {jr.doiPrefixes.join(", ")}
                        </code>
                      </div>
                    )}
                  </div>
                )}

                {/* Selected Checkmark overlay */}
                {isSelected && (
                  <div className="absolute right-2 bottom-2 bg-seline-white/20 rounded-full p-0.5 text-seline-white">
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
