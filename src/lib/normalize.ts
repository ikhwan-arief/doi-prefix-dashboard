/**
 * DOI Prefix Publication Dashboard - Normalization Helpers
 * Creator: Ikhwan Arief (ikhwan@unand.ac.id)
 */

import type { Author } from "./types";

/**
 * Strips HTML and JATS XML tags (like <jats:p>) from abstracts or titles.
 */
export function stripHtml(html?: string): string {
  if (!html) return "";
  return html
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Formats a list of authors into a concise string (e.g., "A. Author, B. Author et al.")
 */
export function formatAuthorsList(authors: Author[], max = 3): string {
  if (!authors || authors.length === 0) return "Unknown Author";
  
  const names = authors
    .map((author) => {
      if (author.name) return author.name;
      const given = author.given || "";
      const family = author.family || "";
      return `${given} ${family}`.trim();
    })
    .filter(Boolean);

  if (names.length === 0) return "Unknown Author";
  if (names.length <= max) return names.join(", ");
  
  return names.slice(0, max).join(", ") + " et al.";
}

/**
 * Formats date strings (YYYY-MM-DD or YYYY/MM or YYYY) into human-readable format.
 */
export function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  
  // YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split("-");
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const mIdx = parseInt(month, 10) - 1;
    return `${parseInt(day, 10)} ${monthNames[mIdx] || month} ${year}`;
  }

  // YYYY/MM format
  if (/^\d{4}\/\d{2}$/.test(dateStr)) {
    const [year, month] = dateStr.split("/");
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const mIdx = parseInt(month, 10) - 1;
    return `${monthNames[mIdx] || month} ${year}`;
  }

  return dateStr;
}
