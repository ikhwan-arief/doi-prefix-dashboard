/**
 * DOI Prefix Publication Dashboard - Main Application Entry
 * Creator: Ikhwan Arief (ikhwan[at]unand.ac.id)
 */

import { useEffect, useState, useMemo } from "react";
import { fetchDashboardData, type DashboardDataset } from "./lib/data";
import { exportArticlesToCSV } from "./lib/csv";
import { SummaryCards } from "./components/SummaryCards";
import { RatioMetricsCards } from "./components/RatioMetricsCards";
import { JournalSidebar } from "./components/JournalSidebar";
import { FilterBar } from "./components/FilterBar";
import { YearChart } from "./components/YearChart";
import { JournalChart } from "./components/JournalChart";
import { AuthorChart } from "./components/AuthorChart";
import { ArticleTable } from "./components/ArticleTable";
import { ArticleDetailModal } from "./components/ArticleDetailModal";
import type { Article } from "./lib/types";
import { Info, ShieldAlert } from "lucide-react";

function App() {
  const [dataset, setDataset] = useState<DashboardDataset | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Sort States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedJournal, setSelectedJournal] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("year-desc");

  // Modal State
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Load Data on Mount
  useEffect(() => {
    fetchDashboardData()
      .then((data) => {
        setDataset(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedYear("");
    setSelectedJournal("");
    setSortBy("year-desc");
  };

  // Filtered & Sorted Articles Memo
  const filteredArticles = useMemo(() => {
    if (!dataset) return [];

    return dataset.articles
      .filter((art) => {
        // 1. Text Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = (art.title || "").toLowerCase().includes(q);
          const matchSubtitle = (art.subtitle || "").toLowerCase().includes(q);
          const matchDoi = (art.doi || "").toLowerCase().includes(q);
          const matchJournal = (art.journal || "").toLowerCase().includes(q);
          const matchPublisher = (art.publisher || "").toLowerCase().includes(q);
          const matchYear = String(art.year || "").includes(q);
          
          // Match authors (given, family, or full name)
          const matchAuthors = art.authors.some(
            (author) =>
              (author.name || "").toLowerCase().includes(q) ||
              (author.given || "").toLowerCase().includes(q) ||
              (author.family || "").toLowerCase().includes(q)
          );

          if (!matchTitle && !matchSubtitle && !matchDoi && !matchJournal && !matchPublisher && !matchYear && !matchAuthors) {
            return false;
          }
        }

        // 2. Year Filter
        if (selectedYear && String(art.year) !== selectedYear) {
          return false;
        }

        // 3. Journal Filter
        if (selectedJournal && art.journal !== selectedJournal) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // 4. Sorting logic
        if (sortBy === "year-desc") {
          return (b.year || 0) - (a.year || 0) || (a.title || "").localeCompare(b.title || "");
        } else if (sortBy === "year-asc") {
          return (a.year || 0) - (b.year || 0) || (a.title || "").localeCompare(b.title || "");
        } else if (sortBy === "citations-desc") {
          return (b.citedByCount || 0) - (a.citedByCount || 0) || (b.year || 0) - (a.year || 0);
        } else if (sortBy === "title-asc") {
          return (a.title || "").localeCompare(b.title || "");
        } else if (sortBy === "title-desc") {
          return (b.title || "").localeCompare(a.title || "");
        }
        return 0;
      });
  }, [dataset, searchQuery, selectedYear, selectedJournal, sortBy]);

  // Export Filtered Dataset to CSV
  const handleExportCSV = () => {
    exportArticlesToCSV(filteredArticles, "filtered-articles-export.csv");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-seline-cream">
        <div className="flex flex-col items-center gap-4">
          {/* Pulsing loading ring */}
          <div className="h-10 w-10 border-4 border-seline-blue border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-seline-slate">
            Loading publication data...
          </span>
        </div>
      </div>
    );
  }

  if (error || !dataset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-seline-cream px-4">
        <div className="max-w-md w-full bg-seline-white border border-seline-pearl-border rounded-seline-cards p-6 shadow-seline-md text-center space-y-4">
          <div className="inline-flex p-3 rounded-full bg-seline-wash text-seline-blue border border-seline-pearl-border">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-display font-medium text-seline-ink">
            Data Load Failed
          </h3>
          <p className="text-sm text-seline-slate leading-relaxed">
            {error || "Data has not been generated yet. Please run the GitHub Actions workflow: Update Crossref Data and Deploy."}
          </p>
          {error?.includes("not found") && (
            <div className="text-xs bg-seline-cream p-3 rounded-md border border-seline-warm-border text-seline-slate text-left font-mono">
              Missing static JSON assets in public/data/. Run "npm run fetch" locally to initialize.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-seline-cream text-seline-ink font-sans transition-all duration-300">
      
      {/* Navbar / Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-seline-cream/80 border-b border-seline-fog-border transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-seline-blue flex items-center justify-center text-seline-white text-xs font-bold font-display">
              A
            </div>
            <div>
              <h1 className="text-base font-display font-medium tracking-tight text-seline-ink">
                Universitas Andalas
              </h1>
              <p className="text-[10px] font-medium text-seline-slate -mt-0.5">
                Publications Catalog
              </p>
            </div>
          </div>

          {/* Seline Navigation Middle Section: Metadata Capsule */}
          <div className="hidden md:flex items-center">
            <span className="text-[11px] font-medium bg-seline-wash text-seline-ink px-3 py-1 rounded-full">
              Prefix 10.25077 • Crossref Catalog
            </span>
          </div>

          {/* Seline Right Section: Primary CTA Filled Button */}
          <button
            onClick={handleExportCSV}
            disabled={filteredArticles.length === 0}
            className="bg-seline-blue text-seline-white text-xs font-medium px-4.5 py-2.5 rounded-full hover:opacity-90 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Export CSV
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Ratio/Average Citation Metrics */}
        <section>
          <RatioMetricsCards articles={dataset.articles} />
        </section>

        {/* Key Indicators */}
        <section>
          <SummaryCards summary={dataset.summary} />
        </section>

        {/* Charts Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-6">
            <YearChart data={dataset.byYear} />
            <AuthorChart articles={dataset.articles} />
          </div>
          <div>
            <JournalChart data={dataset.byJournal} />
          </div>
        </section>

        {/* Filter Toolbar */}
        <section>
          <FilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            selectedJournal={selectedJournal}
            setSelectedJournal={setSelectedJournal}
            sortBy={sortBy}
            setSortBy={setSortBy}
            years={dataset.filters.years}
            journals={dataset.filters.journals}
            onReset={handleResetFilters}
            onExportCSV={handleExportCSV}
            filteredCount={filteredArticles.length}
            totalCount={dataset.summary.totalArticles}
          />
        </section>

        {/* Articles Section with Journal Sidebar */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <div className="lg:col-span-1">
            <JournalSidebar
              articles={dataset.articles}
              selectedJournal={selectedJournal}
              onSelectJournal={setSelectedJournal}
            />
          </div>
          <div className="lg:col-span-3">
            <ArticleTable
              data={filteredArticles}
              onViewDetails={setSelectedArticle}
            />
          </div>
        </section>

      </main>

      {/* Footer Details */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-seline-pearl-border text-xs text-seline-slate space-y-4">
        
        {/* Footnotes */}
        <div className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-seline-white rounded-seline-cards border border-seline-pearl-border">
          <Info className="h-5 w-5 text-seline-blue flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="leading-relaxed">
              <strong className="text-seline-ink font-semibold">Data Source:</strong> Crossref REST API (Prefix: 10.25077)
            </p>
            <p className="leading-relaxed">
              <strong className="text-seline-ink font-semibold">Data Quality Caveat:</strong> This dashboard uses Crossref metadata. Missing titles, authors, pages, abstracts, or dates reflect the metadata deposited to Crossref and may not represent the full publisher record.
            </p>
            <p className="leading-relaxed">
              <strong className="text-seline-ink font-semibold">Citation Warning:</strong> Crossref cited-by count is not the same as Scopus, Web of Science, or Google Scholar citation count. Crossref only counts citations from other publications participating in the Crossref Cited-by service.
            </p>
          </div>
        </div>

        <div className="text-center pt-4 border-t border-seline-fog-border space-y-1">
          <p>© {new Date().getFullYear()} Universitas Andalas Publications List. Built for Crossref Prefix 10.25077.</p>
          <p className="text-[11px] text-seline-soft-slate">
            Application developed by <strong className="font-medium text-seline-ink">Ikhwan Arief</strong> (<a href="mailto:ikhwan[at]unand.ac.id" className="hover:text-seline-blue transition-colors">ikhwan[at]unand.ac.id</a>)
          </p>
        </div>
      </footer>

      {/* Details Dialog Overlay */}
      <ArticleDetailModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        citationIndex={dataset.citationIndex}
      />

    </div>
  );
}

export default App;
