/**
 * DOI Prefix Publication Dashboard - Data Fetch Utilities
 * Creator: Ikhwan Arief (ikhwan@unand.ac.id)
 */

import type { Article, DashboardSummary, ByYearData, ByJournalData, FilterData, SyncLog } from "./types";

export interface DashboardDataset {
  articles: Article[];
  summary: DashboardSummary;
  byYear: ByYearData[];
  byJournal: ByJournalData[];
  filters: FilterData;
  syncLog: SyncLog;
}

/**
 * Fetches all the static JSON files required to populate the dashboard UI.
 * Throws a descriptive error if any of the files are missing or fetch fails.
 */
export async function fetchDashboardData(): Promise<DashboardDataset> {
  const base = import.meta.env.BASE_URL || "/";
  const cleanBase = base.endsWith("/") ? base : `${base}/`;
  
  const getUrl = (filename: string) => `${cleanBase}data/${filename}?t=${new Date().getTime()}`;

  try {
    const [articles, summary, byYear, byJournal, filters, syncLog] = await Promise.all([
      fetch(getUrl("articles.json")).then((res) => {
        if (!res.ok) throw new Error("articles.json not found");
        return res.json() as Promise<Article[]>;
      }),
      fetch(getUrl("summary.json")).then((res) => {
        if (!res.ok) throw new Error("summary.json not found");
        return res.json() as Promise<DashboardSummary>;
      }),
      fetch(getUrl("by-year.json")).then((res) => {
        if (!res.ok) throw new Error("by-year.json not found");
        return res.json() as Promise<ByYearData[]>;
      }),
      fetch(getUrl("by-journal.json")).then((res) => {
        if (!res.ok) throw new Error("by-journal.json not found");
        return res.json() as Promise<ByJournalData[]>;
      }),
      fetch(getUrl("filters.json")).then((res) => {
        if (!res.ok) throw new Error("filters.json not found");
        return res.json() as Promise<FilterData>;
      }),
      fetch(getUrl("sync-log.json")).then((res) => {
        if (!res.ok) throw new Error("sync-log.json not found");
        return res.json() as Promise<SyncLog>;
      }),
    ]);

    const decodeHtmlEntities = (str?: string): string => {
      if (!str) return "";
      return str
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'");
    };

    const decodedArticles = articles.map((art) => ({
      ...art,
      journal: decodeHtmlEntities(art.journal),
      title: decodeHtmlEntities(art.title),
      publisher: decodeHtmlEntities(art.publisher),
    }));

    const decodedByJournal = byJournal.map((item) => ({
      ...item,
      journal: decodeHtmlEntities(item.journal),
    }));

    const decodedFilters = {
      ...filters,
      journals: filters.journals.map(decodeHtmlEntities),
    };

    return {
      articles: decodedArticles,
      summary,
      byYear,
      byJournal: decodedByJournal,
      filters: decodedFilters,
      syncLog,
    };
  } catch (error) {
    console.error("Failed to load static JSON files:", error);
    throw new Error(
      "Data has not been generated yet. Please run the GitHub Actions workflow: Update Crossref Data and Deploy."
    );
  }
}
