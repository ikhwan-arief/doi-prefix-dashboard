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
  
  const getUrl = (filename: string) => `${cleanBase}data/${filename}`;

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

    return { articles, summary, byYear, byJournal, filters, syncLog };
  } catch (error) {
    console.error("Failed to load static JSON files:", error);
    throw new Error(
      "Data has not been generated yet. Please run the GitHub Actions workflow: Update Crossref Data and Deploy."
    );
  }
}
