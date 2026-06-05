/**
 * DOI Prefix Publication Dashboard - Fetch Crossref Data Script
 * Creator: Ikhwan Arief (ikhwan@unand.ac.id)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple .env parser to support local development configuration
const rootDir = path.resolve(__dirname, "..");
const envPath = path.join(rootDir, ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      const value = valueParts.join("=");
      if (key && value) {
        process.env[key.trim()] = value.trim().replace(/^['"]|['"]$/g, "");
      }
    }
  });
}

// Fallback values
const prefix = process.env.CROSSREF_PREFIX || "10.25077";
const mailto = process.env.CROSSREF_MAILTO || "ikhwan@unand.ac.id";
const userAgent = process.env.CROSSREF_USER_AGENT || `DOI Prefix Dashboard/1.0 (mailto:${mailto})`;

const dataDir = path.join(rootDir, "public", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Helper to extract the date in YYYY-MM-DD or YYYY/MM or YYYY format
function getCrossrefDateString(dateObj) {
  if (!dateObj || !dateObj["date-parts"] || !dateObj["date-parts"][0]) return undefined;
  const parts = dateObj["date-parts"][0];
  if (parts.length === 3) {
    const y = parts[0];
    const m = String(parts[1]).padStart(2, "0");
    const d = String(parts[2]).padStart(2, "0");
    return `${y}-${m}-${d}`;
  } else if (parts.length === 2) {
    const y = parts[0];
    const m = String(parts[1]).padStart(2, "0");
    return `${y}/${m}`;
  } else if (parts.length === 1) {
    return `${parts[0]}`;
  }
  return undefined;
}

// Helper to determine the year of the article
function getArticleYear(item) {
  if (item["published-print"]?.["date-parts"]?.[0]?.[0]) return item["published-print"]["date-parts"][0][0];
  if (item["published-online"]?.["date-parts"]?.[0]?.[0]) return item["published-online"]["date-parts"][0][0];
  if (item["published"]?.["date-parts"]?.[0]?.[0]) return item["published"]["date-parts"][0][0];
  if (item["issued"]?.["date-parts"]?.[0]?.[0]) return item["issued"]["date-parts"][0][0];
  return undefined;
}

// Helper to normalize authors list
function normalizeAuthors(authorsList) {
  if (!authorsList || !Array.isArray(authorsList)) return [];
  return authorsList.map((author) => {
    const given = author.given;
    const family = author.family;
    let name = author.name;
    if (!name) {
      if (given && family) {
        name = `${given} ${family}`;
      } else if (family) {
        name = family;
      } else if (given) {
        name = given;
      } else {
        name = "Unknown Author";
      }
    }
    const orcid = author.ORCID;
    const affiliation = author.affiliation
      ? author.affiliation.map((a) => a.name).filter(Boolean)
      : undefined;
    return {
      given,
      family,
      name,
      orcid,
      affiliation,
    };
  });
}

// Normalizer to convert Crossref works into dashboard Article format
function normalizeArticle(item) {
  const doi = (item.DOI || "").toLowerCase();
  const doiUrl = doi ? `https://doi.org/${doi}` : "";
  const title = item.title && item.title[0] ? item.title[0] : "Untitled Document";
  const subtitle = item.subtitle && item.subtitle[0] ? item.subtitle[0] : undefined;
  const journal = item["container-title"] && item["container-title"][0] ? item["container-title"][0] : "Unknown Journal";
  const publisher = item.publisher;
  const type = item.type;
  const year = getArticleYear(item);

  // Establish best available dates
  const publishedDate =
    getCrossrefDateString(item["published-print"]) ||
    getCrossrefDateString(item["published-online"]) ||
    getCrossrefDateString(item.published) ||
    getCrossrefDateString(item.issued);

  const issuedDate = getCrossrefDateString(item.issued);
  const volume = item.volume;
  const issue = item.issue;
  const page = item.page;
  const articleNumber = item["article-number"];
  const url = item.URL || doiUrl;
  const abstract = item.abstract;
  const language = item.language;
  const issn = item.ISSN;
  const isbn = item.ISBN;
  const authors = normalizeAuthors(item.author);
  const referencesCount = item["reference-count"] || 0;
  const citedByCount = item["is-referenced-by-count"] || 0;
  
  const depositedDate = item.deposited ? getCrossrefDateString(item.deposited) : undefined;
  const indexedDate = item.indexed ? getCrossrefDateString(item.indexed) : undefined;
  const createdDate = item.created ? getCrossrefDateString(item.created) : undefined;
  const license = item.license;

  return {
    doi,
    doiUrl,
    title,
    subtitle,
    journal,
    publisher,
    type,
    year,
    publishedDate,
    issuedDate,
    volume,
    issue,
    page,
    articleNumber,
    url,
    abstract,
    language,
    issn,
    isbn,
    authors,
    referencesCount,
    citedByCount,
    depositedDate,
    indexedDate,
    createdDate,
    license,
  };
}

// Fetch single page of Crossref works
async function fetchPage(prefix, cursor, mailto, userAgent, retryCount = 0) {
  const url = `https://api.crossref.org/prefixes/${prefix}/works?filter=type:journal-article&rows=1000&cursor=${encodeURIComponent(cursor)}` + (mailto ? `&mailto=${encodeURIComponent(mailto)}` : "");
  
  const headers = {};
  if (userAgent) {
    headers["User-Agent"] = userAgent;
  }
  
  try {
    const response = await fetch(url, { headers });
    
    if (response.status === 200) {
      return await response.json();
    }
    
    if (response.status === 429) {
      console.warn(`[429 Too Many Requests] Rate limited. Retrying...`);
      if (retryCount >= 5) {
        throw new Error("Max retries exceeded on 429");
      }
      const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 500;
      console.log(`Waiting for ${delay.toFixed(0)}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchPage(prefix, cursor, mailto, userAgent, retryCount + 1);
    }
    
    if (response.status === 403) {
      throw new Error(`[403 Forbidden] Access blocked by Crossref API. Please check your credentials/User-Agent.`);
    }
    
    if (response.status >= 500) {
      console.warn(`[${response.status} Server Error] Temporary error. Retrying...`);
      if (retryCount >= 5) {
        throw new Error(`Max retries exceeded on ${response.status}`);
      }
      const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 500;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchPage(prefix, cursor, mailto, userAgent, retryCount + 1);
    }
    
    throw new Error(`Unexpected HTTP status code: ${response.status}`);
  } catch (error) {
    if (retryCount >= 5) {
      throw error;
    }
    console.warn(`Network/fetch error: ${error.message}. Retrying...`);
    const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 500;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return fetchPage(prefix, cursor, mailto, userAgent, retryCount + 1);
  }
}

// Main execution function
async function main() {
  const startedAt = new Date().toISOString();
  console.log(`=== DOI Prefix Dashboard Crossref Data Sync ===`);
  console.log(`Prefix: ${prefix}`);
  console.log(`Mailto: ${mailto || "not specified"}`);
  console.log(`User-Agent: ${userAgent}`);
  console.log(`Started at: ${startedAt}`);

  let cursor = "*";
  let page = 1;
  let allFetchedItems = [];
  const maxPages = 10000;
  let success = false;
  let errorMessage = null;

  try {
    while (page <= maxPages) {
      console.log(`Fetching page ${page}...`);
      const startTime = Date.now();
      const responseData = await fetchPage(prefix, cursor, mailto, userAgent);
      const elapsed = Date.now() - startTime;
      
      if (responseData.status !== "ok") {
        throw new Error(`API response status is not ok: ${responseData.status}`);
      }

      const items = responseData.message?.items || [];
      const totalResults = responseData.message?.["total-results"] || 0;
      const nextCursor = responseData.message?.["next-cursor"];

      console.log(`Fetched page ${page}: got ${items.length} items (Total in prefix: ${totalResults}, time: ${elapsed}ms)`);
      
      if (items.length === 0) {
        break;
      }
      
      allFetchedItems.push(...items);
      
      if (!nextCursor || items.length === 0) {
        break;
      }
      
      cursor = nextCursor;
      page++;
      
      // Delay to respect API limits (polite pacing)
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
    
    success = true;
  } catch (err) {
    console.error(`Sync error: ${err.message}`);
    errorMessage = err.message;
  }

  const finishedAt = new Date().toISOString();
  console.log(`Sync completed at: ${finishedAt}. Success: ${success}`);

  if (!success) {
    // Write failed sync log
    fs.writeFileSync(
      path.join(dataDir, "sync-log.json"),
      JSON.stringify(
        {
          prefix,
          startedAt,
          finishedAt,
          status: "failed",
          totalFetched: allFetchedItems.length,
          totalArticlesAfterDeduplication: 0,
          errorMessage,
        },
        null,
        2
      )
    );
    process.exit(1);
  }

  console.log(`Processing and normalizing metadata...`);
  const uniqueArticles = new Map();

  allFetchedItems.forEach((item) => {
    if (!item.DOI) return;
    const normalized = normalizeArticle(item);
    if (!normalized.doi) return;
    uniqueArticles.set(normalized.doi, normalized);
  });

  const normalizedArticles = Array.from(uniqueArticles.values());

  // Sort: Year descending, Title ascending
  normalizedArticles.sort((a, b) => {
    const yearDiff = (b.year || 0) - (a.year || 0);
    if (yearDiff !== 0) return yearDiff;
    return (a.title || "").localeCompare(b.title || "");
  });

  // Calculate Aggregations for summary.json
  const totalArticles = normalizedArticles.length;
  const journalSet = new Set();
  let totalCitationsInCrossref = 0;
  let firstYear = 9999;
  let latestYear = 0;

  normalizedArticles.forEach((art) => {
    if (art.journal) {
      journalSet.add(art.journal);
    }
    totalCitationsInCrossref += art.citedByCount || 0;
    if (art.year) {
      if (art.year < firstYear) firstYear = art.year;
      if (art.year > latestYear) latestYear = art.year;
    }
  });

  if (firstYear === 9999) firstYear = 0;

  const summary = {
    prefix,
    totalArticles,
    totalJournals: journalSet.size,
    firstYear,
    latestYear,
    totalCitationsInCrossref,
    lastSync: finishedAt,
    source: "Crossref REST API",
  };

  // Group by Year for by-year.json (ascending order chronologically is standard for chart display)
  const yearCounts = {};
  normalizedArticles.forEach((art) => {
    const yr = art.year || "Unknown";
    yearCounts[yr] = (yearCounts[yr] || 0) + 1;
  });
  const byYear = Object.entries(yearCounts)
    .map(([year, count]) => ({
      year: year === "Unknown" ? "Unknown" : Number(year),
      count,
    }))
    .sort((a, b) => {
      if (a.year === "Unknown") return 1;
      if (b.year === "Unknown") return -1;
      return a.year - b.year;
    });

  // Group by Journal for by-journal.json (sorted descending by count)
  const journalCounts = {};
  normalizedArticles.forEach((art) => {
    const jr = art.journal || "Unknown Journal";
    journalCounts[jr] = (journalCounts[jr] || 0) + 1;
  });
  const byJournal = Object.entries(journalCounts)
    .map(([journal, count]) => ({ journal, count }))
    .sort((a, b) => b.count - a.count);

  // Extract Filters for filters.json
  const uniqueYears = Array.from(
    new Set(normalizedArticles.map((art) => art.year).filter(Boolean))
  ).sort((a, b) => b - a); // descending years
  const uniqueJournals = Array.from(journalSet).sort((a, b) =>
    a.localeCompare(b)
  ); // ascending journals

  const filters = {
    years: uniqueYears,
    journals: uniqueJournals,
  };

  // Write outputs
  fs.writeFileSync(path.join(dataDir, "articles.json"), JSON.stringify(normalizedArticles, null, 2));
  fs.writeFileSync(path.join(dataDir, "summary.json"), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(dataDir, "by-year.json"), JSON.stringify(byYear, null, 2));
  fs.writeFileSync(path.join(dataDir, "by-journal.json"), JSON.stringify(byJournal, null, 2));
  fs.writeFileSync(path.join(dataDir, "filters.json"), JSON.stringify(filters, null, 2));
  
  // Write successful sync-log
  fs.writeFileSync(
    path.join(dataDir, "sync-log.json"),
    JSON.stringify(
      {
        prefix,
        startedAt,
        finishedAt,
        status: "success",
        totalFetched: allFetchedItems.length,
        totalArticlesAfterDeduplication: totalArticles,
        errorMessage: null,
      },
      null,
      2
    )
  );

  console.log(`Saved articles.json (${totalArticles} items)`);
  console.log(`Saved summary.json`);
  console.log(`Saved by-year.json`);
  console.log(`Saved by-journal.json`);
  console.log(`Saved filters.json`);
  console.log(`Saved sync-log.json`);
  console.log(`=== Done ===`);
}

main();
