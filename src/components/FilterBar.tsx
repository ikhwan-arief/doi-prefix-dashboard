/**
 * DOI Prefix Publication Dashboard - Filter Bar Component
 * Redesigned to Seline Analytics Style Guidelines
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
    <div className="bg-seline-white rounded-seline-cards border border-seline-pearl-border p-5 shadow-seline-sm space-y-4">
      {/* Upper Row: Search & Export */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-seline-soft-slate" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2.5 bg-seline-white border border-seline-warm-border rounded-seline-inputs text-seline-ink placeholder-seline-soft-slate text-sm focus:outline-none focus:border-seline-blue focus:ring-1 focus:ring-seline-blue transition-all h-[42px]"
            placeholder="Search title, DOI, journal, author, publisher, year..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <button
          onClick={onExportCSV}
          disabled={filteredCount === 0}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-seline-blue hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-seline-white text-sm font-medium rounded-full transition-all cursor-pointer h-[42px]"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Lower Row: Filters, Sort, Reset */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3 pt-3 border-t border-seline-pearl-border">
        
        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Filter Icon and Label */}
          <div className="hidden lg:flex items-center gap-1.5 text-seline-slate text-xs font-medium uppercase tracking-wider">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter By</span>
          </div>

          {/* Year Select */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full sm:w-32 px-3 py-2 bg-seline-white border border-seline-warm-border rounded-seline-inputs text-seline-slate text-sm focus:outline-none focus:border-seline-blue focus:ring-1 focus:ring-seline-blue transition-all cursor-pointer h-[42px]"
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
            className="w-full sm:w-64 px-3 py-2 bg-seline-white border border-seline-warm-border rounded-seline-inputs text-seline-slate text-sm truncate focus:outline-none focus:border-seline-blue focus:ring-1 focus:ring-seline-blue transition-all cursor-pointer h-[42px]"
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
            className="w-full sm:w-48 px-3 py-2 bg-seline-white border border-seline-warm-border rounded-seline-inputs text-seline-slate text-sm focus:outline-none focus:border-seline-blue focus:ring-1 focus:ring-seline-blue transition-all cursor-pointer h-[42px]"
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
          <div className="text-xs font-medium text-seline-slate">
            Showing <strong className="font-semibold text-seline-ink">{filteredCount}</strong> of <strong className="font-semibold text-seline-ink">{totalCount}</strong> articles
          </div>

          {(searchQuery || selectedYear || selectedJournal || sortBy !== "year-desc") && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-seline-blue hover:underline bg-transparent rounded-full font-medium transition-all cursor-pointer"
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
