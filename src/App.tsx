import { useEffect, useState, useMemo } from "react";
import { fetchDashboardData, type DashboardDataset } from "./lib/data";
import { exportArticlesToCSV } from "./lib/csv";
import { SummaryCards } from "./components/SummaryCards";
import { FilterBar } from "./components/FilterBar";
import { YearChart } from "./components/YearChart";
import { JournalChart } from "./components/JournalChart";
import { ArticleTable } from "./components/ArticleTable";
import { ArticleDetailModal } from "./components/ArticleDetailModal";
import type { Article } from "./lib/types";
import { Sun, Moon, Info, ShieldAlert, Award } from "lucide-react";

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

  // Dark Mode State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return false;
  });

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

  // Sync Dark Mode theme class to HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          {/* Pulsing loading ring */}
          <div className="h-10 w-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Loading publication data...
          </span>
        </div>
      </div>
    );
  }

  if (error || !dataset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl text-center space-y-4">
          <div className="inline-flex p-3 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-500 border border-rose-100 dark:border-rose-900/30">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            Data Load Failed
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {error || "Data has not been generated yet. Please run the GitHub Actions workflow: Update Crossref Data and Deploy."}
          </p>
          {error?.includes("not found") && (
            <div className="text-xs bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850 text-slate-500 text-left font-mono">
              Missing static JSON assets in public/data/. Run "npm run fetch" locally to initialize.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Navbar / Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/60 dark:border-slate-800/60 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/15">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-slate-800 dark:text-white">
                DOI Prefix Dashboard
              </h1>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 -mt-0.5">
                Prefix 10.25077 • Crossref Catalog
              </p>
            </div>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Key Indicators */}
        <section>
          <SummaryCards summary={dataset.summary} />
        </section>

        {/* Charts Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <YearChart data={dataset.byYear} />
          <JournalChart data={dataset.byJournal} />
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

        {/* Articles Data Grid */}
        <section>
          <ArticleTable
            data={filteredArticles}
            onViewDetails={setSelectedArticle}
          />
        </section>

      </main>

      {/* Footer Details */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400 space-y-4">
        
        {/* Footnotes */}
        <div className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-slate-100/50 dark:bg-slate-900/30 rounded-2xl border border-slate-150 dark:border-slate-850">
          <Info className="h-5 w-5 text-sky-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="leading-relaxed">
              <strong>Data Quality Caveat:</strong> This dashboard uses Crossref metadata. Missing titles, authors, pages, abstracts, or dates reflect the metadata deposited to Crossref and may not represent the full publisher record.
            </p>
            <p className="leading-relaxed">
              <strong>Citation Warning:</strong> Crossref cited-by count is not the same as Scopus, Web of Science, or Google Scholar citation count. Crossref only counts citations from other publications participating in the Crossref Cited-by service.
            </p>
          </div>
        </div>

        <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-900">
          <p>© {new Date().getFullYear()} DOI Prefix Dashboard. Built for Crossref Prefix 10.25077.</p>
        </div>
      </footer>

      {/* Details Dialog Overlay */}
      <ArticleDetailModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />

    </div>
  );
}

export default App;
