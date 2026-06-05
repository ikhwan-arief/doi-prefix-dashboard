/**
 * DOI Prefix Publication Dashboard - CSV Exporter
 * Creator: Ikhwan Arief (ikhwan@unand.ac.id)
 */

import type { Article } from "./types";

/**
 * Escapes standard CSV special characters (quotes, commas, newlines) and formats lists.
 */
function escapeCSVValue(val: unknown): string {
  if (val === null || val === undefined) return "";
  
  let str = String(val);
  
  // Replace all carriage returns and line feeds with spaces
  str = str.replace(/\r?\n|\r/g, " ");

  // Double quotes escaping: replace " with "" and wrap the whole cell in "
  if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r") || str.includes(";")) {
    str = `"${str.replace(/"/g, '""')}"`;
  } else if (str.includes(" ")) {
    // Wrap fields containing spaces in quotes for security and Excel compatibility
    str = `"${str}"`;
  }
  
  return str;
}

/**
 * Generates a UTF-8 encoded CSV file from articles and triggers browser download.
 */
export function exportArticlesToCSV(articles: Article[], filename = "doi-prefix-articles.csv") {
  const headers = [
    "Year",
    "Title",
    "Authors",
    "Journal",
    "DOI",
    "DOI URL",
    "Publisher",
    "Volume",
    "Issue",
    "Page",
    "Cited By Count",
    "Reference Count",
    "Published Date",
    "Deposited Date",
    "Indexed Date"
  ];

  const rows = articles.map((art) => {
    const authorsStr = art.authors 
      ? art.authors.map((a) => a.name || `${a.given || ""} ${a.family || ""}`.trim()).join("; ") 
      : "";
      
    return [
      art.year ?? "",
      art.title ?? "",
      authorsStr,
      art.journal ?? "",
      art.doi ?? "",
      art.doiUrl ?? "",
      art.publisher ?? "",
      art.volume ?? "",
      art.issue ?? "",
      art.page ?? "",
      art.citedByCount ?? 0,
      art.referencesCount ?? 0,
      art.publishedDate ?? "",
      art.depositedDate ?? "",
      art.indexedDate ?? ""
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map(escapeCSVValue).join(","))
  ].join("\r\n");

  // UTF-8 BOM to force Excel to open in UTF-8 mode
  const BOM = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const blob = new Blob([BOM, csvContent], { type: "text/csv;charset=utf-8;" });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
