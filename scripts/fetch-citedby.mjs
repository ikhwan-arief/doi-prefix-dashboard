/**
 * DOI Prefix Publication Dashboard - Crossref Cited-by Ingestion Script
 * Creator: Ikhwan Arief (ikhwan[at]unand.ac.id)
 */

import fs from "fs";
import path from "path";
import { XMLParser } from "fast-xml-parser";
import pLimit from "p-limit";

// Configure variables
const prefix = process.env.CROSSREF_PREFIX || "10.25077";
const username = process.env.CROSSREF_CITEDBY_USER;
const password = process.env.CROSSREF_CITEDBY_PASSWORD;
const startDate = process.env.CITEDBY_START_DATE || "2000-01-01";
const endDate = process.env.CITEDBY_END_DATE || "2030-12-31";
const mailto = process.env.CROSSREF_MAILTO || "ikhwan[at]unand.ac.id";
const userAgent = process.env.CROSSREF_USER_AGENT || `DOI Prefix Dashboard/1.0 (mailto:${mailto})`;

const dataDir = path.join(process.cwd(), "public", "data");

// Helper to write outputs
const writeJson = (filename, data) => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(path.join(dataDir, filename), JSON.stringify(data, null, 2), "utf8");
  console.log(`Saved: ${filename}`);
};

async function run() {
  console.log("Starting Crossref Cited-by Ingestion...");

  // Graceful Fallback if credentials are not set
  if (!username || !password) {
    console.warn("WARNING: CROSSREF_CITEDBY_USER or CROSSREF_CITEDBY_PASSWORD environment variables are missing.");
    console.warn("Generating empty citation files to enable graceful deployment fallback.");

    const defaultSummary = {
      prefix,
      source: "Crossref Cited-by",
      totalCitationPairs: 0,
      totalCitedArticlesWithCitations: 0,
      totalUniqueCitingDois: 0,
      totalUniqueCitingJournals: 0,
      startDate,
      endDate,
      lastSync: new Date().toISOString(),
      isConfigured: false
    };

    writeJson("citations.json", []);
    writeJson("citation-index.json", {});
    writeJson("citing-journals.json", []);
    writeJson("citation-summary.json", defaultSummary);

    console.log("Graceful fallback execution completed successfully.");
    process.exit(0);
  }

  try {
    // 1. Fetch forward links XML
    const servletUrl = new URL("https://doi.crossref.org/servlet/getForwardLinks");
    servletUrl.searchParams.set("usr", username);
    servletUrl.searchParams.set("pwd", password);
    servletUrl.searchParams.set("doi", prefix);
    servletUrl.searchParams.set("startDate", startDate);
    servletUrl.searchParams.set("endDate", endDate);

    console.log(`Fetching forward links for prefix: ${prefix} (${startDate} to ${endDate})...`);
    
    const response = await fetch(servletUrl.toString(), {
      headers: {
        "User-Agent": userAgent
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const xmlText = await response.text();
    
    // Check if the response indicates an error
    if (xmlText.includes("Invalid login") || xmlText.includes("does not have permissions") || xmlText.includes("Error: ")) {
      console.error("Crossref servlet returned an error response content.");
      throw new Error("Crossref Cited-by login or permission error.");
    }

    // 2. Parse XML
    console.log("Parsing XML response...");
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });
    const parsedObj = parser.parse(xmlText);

    // 3. Extract citation pairs recursively
    const pairs = [];
    
    // Recursive scanner to extract cited -> citing relationships from fast-xml-parser tree
    function scanNode(node, currentCitedDoi = null) {
      if (!node || typeof node !== "object") return;

      // Check for DOI node representing the cited article
      let activeCited = currentCitedDoi;
      if (node.doi && typeof node.doi === "string" && node.doi.toLowerCase().startsWith(prefix.toLowerCase())) {
        activeCited = node.doi.toLowerCase().trim();
      }

      // Check if it's a citation or link relationship representing the citing article
      if (node.citation && Array.isArray(node.citation)) {
        node.citation.forEach(cit => {
          if (cit.doi && activeCited) {
            pairs.push({
              citedDoi: activeCited,
              citingDoi: cit.doi.toLowerCase().trim(),
              matchDate: cit.msg_date || new Date().toISOString().substring(0, 10)
            });
          }
        });
      } else if (node.citation && typeof node.citation === "object") {
        if (node.citation.doi && activeCited) {
          pairs.push({
            citedDoi: activeCited,
            citingDoi: node.citation.doi.toLowerCase().trim(),
            matchDate: node.citation.msg_date || new Date().toISOString().substring(0, 10)
          });
        }
      }

      // Handle forward link structure specifically if present
      if (node.forward_link) {
        const links = Array.isArray(node.forward_link) ? node.forward_link : [node.forward_link];
        links.forEach(link => {
          const cited = link.journal_article?.doi || link.book_item?.doi || link.conference_paper?.doi;
          const citedClean = cited ? String(cited).toLowerCase().trim() : null;
          
          if (citedClean) {
            const citations = link.citation_list?.citation;
            if (citations) {
              const citArray = Array.isArray(citations) ? citations : [citations];
              citArray.forEach(c => {
                if (c.doi) {
                  pairs.push({
                    citedDoi: citedClean,
                    citingDoi: String(c.doi).toLowerCase().trim(),
                    matchDate: c.msg_date || new Date().toISOString().substring(0, 10)
                  });
                }
              });
            }
          }
        });
      }

      // Recursively traverse other properties
      for (const key in node) {
        if (key !== "doi" && key !== "citation" && key !== "forward_link") {
          const val = node[key];
          if (Array.isArray(val)) {
            val.forEach(item => scanNode(item, activeCited));
          } else if (typeof val === "object") {
            scanNode(val, activeCited);
          }
        }
      }
    }

    scanNode(parsedObj);

    // Deduplicate pairs by citedDoi + citingDoi
    const uniquePairsMap = new Map();
    pairs.forEach(p => {
      const key = `${p.citedDoi}||${p.citingDoi}`;
      if (!uniquePairsMap.has(key)) {
        uniquePairsMap.set(key, p);
      }
    });

    const deduplicatedPairs = Array.from(uniquePairsMap.values());
    console.log(`Extracted ${deduplicatedPairs.length} unique citation pairs from XML.`);

    // 4. Enrich Citing DOIs with metadata from Crossref REST API
    const uniqueCitingDois = Array.from(new Set(deduplicatedPairs.map(p => p.citingDoi)));
    console.log(`Enriching metadata for ${uniqueCitingDois.length} unique citing DOIs...`);

    const enrichedMetadata = {};
    const limit = pLimit(3); // Concurrency limit of 3

    await Promise.all(
      uniqueCitingDois.map(doi =>
        limit(async () => {
          try {
            // Delay 300ms between requests
            await new Promise(resolve => setTimeout(resolve, 300));

            const worksUrl = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
            const res = await fetch(worksUrl, {
              headers: {
                "User-Agent": userAgent
              }
            });

            if (res.ok) {
              const payload = await res.json();
              const item = payload.message;
              
              // Extract year safely
              let year = null;
              if (item.published?.["date-parts"]?.[0]?.[0]) {
                year = Number(item.published["date-parts"][0][0]);
              } else if (item.created?.["date-parts"]?.[0]?.[0]) {
                year = Number(item.created["date-parts"][0][0]);
              }

              // Extract authors safely
              const authors = [];
              if (item.author) {
                item.author.forEach(a => {
                  const name = a.name || `${a.given || ""} ${a.family || ""}`.trim();
                  if (name) authors.push(name);
                });
              }

              enrichedMetadata[doi] = {
                title: item.title?.[0] || "Untitled Citing Article",
                journal: item["container-title"]?.[0] || item.publisher || "Unknown Source",
                publisher: item.publisher || "Unknown Publisher",
                year: year || new Date().getFullYear(),
                type: item.type || "journal-article",
                authors: authors.length > 0 ? authors : ["Unknown Author"],
                volume: item.volume || undefined,
                issue: item.issue || undefined,
                page: item.page || undefined,
                url: item.URL || `https://doi.org/${doi}`
              };
            } else {
              console.warn(`Could not enrich metadata for: ${doi} (HTTP status: ${res.status})`);
            }
          } catch (err) {
            console.warn(`Error enriching metadata for: ${doi}`, err.message);
          }
        })
      )
    );

    // 5. Combine and construct output models
    const finalCitations = [];
    const index = {};
    const citingJournalCounts = {};

    deduplicatedPairs.forEach(p => {
      const meta = enrichedMetadata[p.citingDoi] || {
        title: "Untitled Citing Article",
        journal: "Unknown Source",
        publisher: "Unknown Publisher",
        year: new Date().getFullYear(),
        type: "journal-article",
        authors: ["Unknown Author"],
        url: `https://doi.org/${p.citingDoi}`
      };

      const record = {
        citedDoi: p.citedDoi,
        citingDoi: p.citingDoi,
        citingDoiUrl: meta.url,
        citingTitle: meta.title,
        citingJournal: meta.journal,
        citingPublisher: meta.publisher,
        citingYear: meta.year,
        citingType: meta.type,
        citingAuthors: meta.authors,
        citingVolume: meta.volume,
        citingIssue: meta.issue,
        citingPage: meta.page,
        citationMatchDate: p.matchDate,
        source: "Crossref Cited-by"
      };

      finalCitations.push(record);

      // Add to index
      if (!index[p.citedDoi]) {
        index[p.citedDoi] = [];
      }
      index[p.citedDoi].push({
        citingDoi: record.citingDoi,
        citingDoiUrl: record.citingDoiUrl,
        citingTitle: record.citingTitle,
        citingJournal: record.citingJournal,
        citingPublisher: record.citingPublisher,
        citingYear: record.citingYear,
        citingType: record.citingType,
        citingAuthors: record.citingAuthors,
        citingVolume: record.citingVolume,
        citingIssue: record.citingIssue,
        citingPage: record.citingPage,
        citationMatchDate: record.citationMatchDate,
        source: record.source
      });

      // Count citing journals
      const journalName = record.citingJournal;
      citingJournalCounts[journalName] = (citingJournalCounts[journalName] || 0) + 1;
    });

    // Formatting top citing journals
    const finalCitingJournals = Object.entries(citingJournalCounts)
      .map(([citingJournal, count]) => ({ citingJournal, count }))
      .sort((a, b) => b.count - a.count);

    // Summary block
    const finalSummary = {
      prefix,
      source: "Crossref Cited-by",
      totalCitationPairs: finalCitations.length,
      totalCitedArticlesWithCitations: Object.keys(index).length,
      totalUniqueCitingDois: uniqueCitingDois.length,
      totalUniqueCitingJournals: finalCitingJournals.length,
      startDate,
      endDate,
      lastSync: new Date().toISOString(),
      isConfigured: true
    };

    // Save JSON files
    writeJson("citations.json", finalCitations);
    writeJson("citation-index.json", index);
    writeJson("citing-journals.json", finalCitingJournals);
    writeJson("citation-summary.json", finalSummary);

    console.log("Crossref Ingestion completed successfully!");

  } catch (error) {
    console.error("Crossref Cited-by request failed. Check credentials, prefix, date range, or Crossref availability.");
    console.error("Detail:", error.message);
    process.exit(1);
  }
}

run();
