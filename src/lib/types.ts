/**
 * DOI Prefix Publication Dashboard - TypeScript Types
 * Creator: Ikhwan Arief (ikhwan[at]unand.ac.id)
 */

export type Author = {
  given?: string;
  family?: string;
  name?: string;
  orcid?: string;
  affiliation?: string[];
};

export type LicenseInfo = {
  URL?: string;
  start?: {
    "date-parts"?: number[][];
  };
  "delay-in-days"?: number;
  "content-version"?: string;
};

export type Article = {
  doi: string;
  doiUrl: string;
  title: string;
  subtitle?: string;
  journal: string;
  publisher?: string;
  type?: string;
  year?: number;
  publishedDate?: string;
  issuedDate?: string;
  volume?: string;
  issue?: string;
  page?: string;
  articleNumber?: string;
  url?: string;
  abstract?: string;
  language?: string;
  issn?: string[];
  isbn?: string[];
  authors: Author[];
  referencesCount?: number;
  citedByCount?: number;
  depositedDate?: string;
  indexedDate?: string;
  createdDate?: string;
  license?: LicenseInfo[];
  references?: {
    key?: string;
    doi?: string;
    unstructured?: string;
  }[];
  subjects?: string[];
};

export type DashboardSummary = {
  prefix: string;
  totalArticles: number;
  totalJournals: number;
  firstYear: number;
  latestYear: number;
  totalCitationsInCrossref: number;
  lastSync: string;
  source: string;
};

export type ByYearData = {
  year: number | string;
  count: number;
};

export type ByJournalData = {
  journal: string;
  count: number;
};

export type FilterData = {
  years: number[];
  journals: string[];
};

export type SyncLog = {
  prefix: string;
  startedAt: string;
  finishedAt: string;
  status: "success" | "failed";
  totalFetched: number;
  totalArticlesAfterDeduplication: number;
  errorMessage: string | null;
};

export type CitationRecord = {
  citedDoi: string;
  citedTitle?: string;
  citedJournal?: string;
  citedYear?: number;

  citingDoi: string;
  citingDoiUrl: string;
  citingTitle?: string;
  citingJournal?: string;
  citingPublisher?: string;
  citingYear?: number;
  citingType?: string;
  citingAuthors?: string[];
  citingVolume?: string;
  citingIssue?: string;
  citingPage?: string;

  citationMatchDate?: string;
  source: "Crossref Cited-by";
};

export type CitationSummary = {
  prefix: string;
  source: string;
  totalCitationPairs: number;
  totalCitedArticlesWithCitations: number;
  totalUniqueCitingDois: number;
  totalUniqueCitingJournals: number;
  startDate: string;
  endDate: string;
  lastSync: string;
  isConfigured: boolean;
};
