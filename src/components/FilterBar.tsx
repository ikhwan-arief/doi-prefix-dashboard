/**
 * DOI Prefix Publication Dashboard - Filter Bar Component
 * Creator: Ikhwan Arief (ikhwan[at]unand.ac.id)
 */

import React from "react";
import { Search, RotateCcw, Download, Filter } from "lucide-react";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  selectedJournal: string;
  setSelectedJournal: (journal: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  years: number[];
  journals: string[];
  onReset: () => void;
  onExportCSV: () => void;
  filteredCount: number;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedYear,
  setSelectedYear,
  selectedJournal,
  setSelectedJournal,
  sortBy,
  setSortBy,
  years,
  journals,
  onReset,
  onExportCSV,
  filteredCount,
  totalCount,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 p-5 shadow-sm space-y-4">
      {/* Upper Row: Search & Export */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            placeholder="Search title, DOI, journal, author, publisher, year..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <button
          onClick={onExportCSV}
          disabled={filteredCount === 0}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-sky-500/10 cursor-pointer"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Lower Row: Filters, Sort, Reset */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-850">
        
        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Filter Icon and Label */}
          <div className="hidden lg:flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter By</span>
          </div>

          {/* Year Select */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full sm:w-32 px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all cursor-pointer"
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Journal Select */}
          <select
            value={selectedJournal}
            onChange={(e) => setSelectedJournal(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 text-sm truncate focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all cursor-pointer"
          >
            <option value="">All Journals</option>
            {journals.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>

          {/* Sort Select */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all cursor-pointer"
          >
            <option value="year-desc">Year: Newest First</option>
            <option value="year-asc">Year: Oldest First</option>
            <option value="citations-desc">Citations: High to Low</option>
            <option value="title-asc">Title: A to Z</option>
            <option value="title-desc">Title: Z to A</option>
          </select>
        </div>

        {/* Counter and Reset */}
        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Showing <strong className="font-semibold text-slate-700 dark:text-slate-200">{filteredCount}</strong> of <strong className="font-semibold text-slate-700 dark:text-slate-200">{totalCount}</strong> articles
          </div>

          {(searchQuery || selectedYear || selectedJournal || sortBy !== "year-desc") && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100/70 dark:bg-rose-950/20 dark:hover:bg-rose-950/45 border border-rose-100 dark:border-rose-900/40 rounded-lg font-semibold transition-all cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
