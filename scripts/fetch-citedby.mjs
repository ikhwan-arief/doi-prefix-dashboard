/**
 * DOI Prefix Publication Dashboard - Crossref Cited-by Ingestion Script
 * Creator: Ikhwan Arief (ikhwan[at]unand.ac.id)
 */

import fs from "fs";
import path from "path";
import { XMLParser } from "fast-xml-parser";
import pLimit from "p-limit";

// Simple .env parser to support local development configuration
const envPath = path.join(process.cwd(), ".env");
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

    // 3. Extract citation pairs and metadata from XML
    const finalCitations = [];
    const index = {};
    const citingJournalCounts = {};
    const body = parsedObj.crossref_result?.query_result?.body;

    if (body && body.forward_link) {
      const links = Array.isArray(body.forward_link) ? body.forward_link : [body.forward_link];
      console.log(`Extracting citing metadata from ${links.length} forward links...`);
      
      links.forEach((link) => {
        const citedDoiAttr = link["@_doi"];
        if (!citedDoiAttr) return;
        
        const citedDoiClean = citedDoiAttr.toLowerCase().trim();
        // Check if the cited DOI belongs to our prefix
        if (!citedDoiClean.startsWith(prefix.toLowerCase())) {
          return;
        }
        
        // Find citeNode (journal_cite, conf_cite, book_cite, etc.)
        const citeNode = link.journal_cite || link.conf_cite || link.book_cite || link.dissertation_cite || link.report_cite || link.standard_cite || link.other_cite;
        if (!citeNode) return;
        
        // Extract citing DOI
        let citingDoi = null;
        if (citeNode.doi) {
          if (typeof citeNode.doi === "string") {
            citingDoi = citeNode.doi.toLowerCase().trim();
          } else if (typeof citeNode.doi === "object") {
            citingDoi = (citeNode.doi["#text"] || "").toLowerCase().trim();
          }
        }
        
        if (!citingDoi) return;
        
        // Extract year
        let citingYear = citeNode.year;
        if (citingYear && typeof citingYear === "object") {
          citingYear = citingYear["#text"] || citingYear;
        }
        citingYear = Number(citingYear) || new Date().getFullYear();
        
        // Extract title safely
        let citingTitle = citeNode.article_title || citeNode.paper_title || citeNode.title || "Untitled Citing Article";
        if (typeof citingTitle === "object") {
          citingTitle = citingTitle["#text"] || "Untitled Citing Article";
        }
        
        // Extract journal/publisher
        let citingJournal = citeNode.journal_title || citeNode.volume_title || citeNode.publisher || "Unknown Source";
        if (typeof citingJournal === "object") {
          citingJournal = citingJournal["#text"] || "Unknown Source";
        }
        let citingPublisher = citeNode.publisher || "Unknown Publisher";
        if (typeof citingPublisher === "object") {
          citingPublisher = citingPublisher["#text"] || "Unknown Publisher";
        }
        
        // Extract contributors/authors
        const authors = [];
        if (citeNode.contributors && citeNode.contributors.contributor) {
          const contribs = Array.isArray(citeNode.contributors.contributor) 
            ? citeNode.contributors.contributor 
            : [citeNode.contributors.contributor];
          contribs.forEach(c => {
            const given = c.given_name || "";
            const family = c.surname || "";
            const name = c.name || `${given} ${family}`.trim();
            if (name) authors.push(name);
          });
        }
        const finalAuthors = authors.length > 0 ? authors : ["Unknown Author"];
        
        const record = {
          citedDoi: citedDoiClean,
          citingDoi: citingDoi,
          citingDoiUrl: `https://doi.org/${citingDoi}`,
          citingTitle: String(citingTitle),
          citingJournal: String(citingJournal),
          citingPublisher: String(citingPublisher),
          citingYear: citingYear,
          citingType: citeNode.publication_type || (link.journal_cite ? "journal-article" : "proceedings-article"),
          citingAuthors: finalAuthors,
          citingVolume: citeNode.volume ? String(citeNode.volume) : undefined,
          citingIssue: citeNode.issue ? String(citeNode.issue) : undefined,
          citingPage: citeNode.first_page ? String(citeNode.first_page) : undefined,
          citationMatchDate: citeNode.msg_date || new Date().toISOString().substring(0, 10),
          source: "Crossref Cited-by"
        };
        
        finalCitations.push(record);
        
        // Add to index
        if (!index[record.citedDoi]) {
          index[record.citedDoi] = [];
        }
        
        // Avoid duplicate citing DOIs for the same cited DOI
        const exists = index[record.citedDoi].some(x => x.citingDoi === record.citingDoi);
        if (!exists) {
          index[record.citedDoi].push({
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
        }
        
        // Count citing journals
        const journalName = record.citingJournal;
        citingJournalCounts[journalName] = (citingJournalCounts[journalName] || 0) + 1;
      });
    }

    // Deduplicate total list by key
    const uniqueCitationsMap = new Map();
    finalCitations.forEach(c => {
      uniqueCitationsMap.set(`${c.citedDoi}||${c.citingDoi}`, c);
    });
    const finalUniqueCitations = Array.from(uniqueCitationsMap.values());

    console.log(`Extracted ${finalUniqueCitations.length} unique citation pairs from XML.`);
    
    const uniqueCitingDois = Array.from(new Set(finalUniqueCitations.map(p => p.citingDoi)));

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
