/**
 * DOI Prefix Publication Dashboard - Article Detail Modal Component
 * Redesigned to Seline Analytics Style Guidelines
 */

import React, { useEffect, useRef, useState, useMemo } from "react";
import { X, ExternalLink, BookOpen, Quote, User, FileText, BadgeCheck, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { Article, CitationRecord } from "../lib/types";
import { stripHtml, formatDate } from "../lib/normalize";

const getLicenseName = (url?: string): string => {
  if (!url) return "No License";
  const lower = url.toLowerCase();
  
  if (lower.includes("creativecommons.org/licenses/")) {
    const match = lower.match(/\/licenses\/([a-z-]+)\/([0-9.]+)/);
    if (match) {
      const code = match[1].toUpperCase();
      const version = match[2];
      return `CC ${code} ${version}`;
    }
    return "Creative Commons";
  }
  
  if (lower.includes("creativecommons.org/publicdomain/zero/1.0")) {
    return "CC0 1.0 (Public Domain)";
  }
  
  try {
    const domain = new URL(url).hostname.replace("www.", "");
    return `License (${domain})`;
  } catch {
    return "Registered License";
  }
};

interface ArticleDetailModalProps {
  article: Article | null;
  onClose: () => void;
  citationIndex: Record<string, CitationRecord[]>;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({ article, onClose, citationIndex }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [activeTab, setActiveTab] = useState<"details" | "citations" | "references">("details");
  const [citingSearchQuery, setCitingSearchQuery] = useState<string>("");
  const [refSearchQuery, setRefSearchQuery] = useState<string>("");
  const [sortField, setSortField] = useState<"year" | "journal" | null>("year");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [prevArticleId, setPrevArticleId] = useState<string | null>(null);
  const currentArticleId = article?.doi || null;

  if (currentArticleId !== prevArticleId) {
    setPrevArticleId(currentArticleId);
    setActiveTab("details");
    setCitingSearchQuery("");
    setRefSearchQuery("");
    setSortField("year");
    setSortDirection("desc");
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (article) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [article]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      onClose();
    };

    // Coordinates check fallback for browsers that do not support closedby="any"
    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target !== dialog) return;

      const rect = dialog.getBoundingClientRect();
      const isInside = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );

      if (!isInside) {
        dialog.close();
      }
    };

    dialog.addEventListener("close", handleClose);
    dialog.addEventListener("click", handleBackdropClick);

    return () => {
      dialog.removeEventListener("close", handleClose);
      dialog.removeEventListener("click", handleBackdropClick);
    };
  }, [onClose]);

  const citedDoi = article?.doi?.toLowerCase() || "";
  const citingArticles = useMemo(() => {
    if (!article) return [];
    return citationIndex?.[citedDoi] || [];
  }, [article, citedDoi, citationIndex]);

  const sortedAndFilteredCitingArticles = useMemo(() => {
    let list = [...citingArticles];
    if (citingSearchQuery.trim()) {
      const q = citingSearchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          (c.citingTitle || "").toLowerCase().includes(q) ||
          (c.citingJournal || "").toLowerCase().includes(q) ||
          (c.citingDoi || "").toLowerCase().includes(q) ||
          (c.citingPublisher || "").toLowerCase().includes(q) ||
          String(c.citingYear || "").includes(q) ||
          (c.citingAuthors || []).some((a) => a.toLowerCase().includes(q))
      );
    }

    if (sortField) {
      list.sort((a, b) => {
        let valA: string | number = "";
        let valB: string | number = "";

        if (sortField === "year") {
          valA = a.citingYear ?? 0;
          valB = b.citingYear ?? 0;
        } else if (sortField === "journal") {
          valA = (a.citingJournal || "").toLowerCase();
          valB = (b.citingJournal || "").toLowerCase();
        }

        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [citingArticles, citingSearchQuery, sortField, sortDirection]);

  const filteredReferences = useMemo(() => {
    if (!article || !article.references) return [];
    let list = article.references;
    if (refSearchQuery.trim()) {
      const q = refSearchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          (r.unstructured || "").toLowerCase().includes(q) ||
          (r.doi || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [article, refSearchQuery]);

  const handleSort = (field: "year" | "journal") => {
    if (sortField === field) {
      if (field === "year") {
        if (sortDirection === "desc") {
          setSortDirection("asc");
        } else {
          setSortField(null);
        }
      } else {
        if (sortDirection === "asc") {
          setSortDirection("desc");
        } else {
          setSortField(null);
        }
      }
    } else {
      setSortField(field);
      setSortDirection(field === "year" ? "desc" : "asc");
    }
  };

  if (!article) return null;

  const abstractText = stripHtml(article.abstract);

  // Format ISSN/ISBN list
  const identifiers = [];
  if (article.issn && article.issn.length > 0) {
    identifiers.push(`ISSN: ${article.issn.join(", ")}`);
  }
  if (article.isbn && article.isbn.length > 0) {
    identifiers.push(`ISBN: ${article.isbn.join(", ")}`);
  }

  // Get license URL
  const licenseUrl = article.license && Array.isArray(article.license) && article.license[0]?.URL;

  return (
    <dialog
      ref={dialogRef}
      {...{ closedby: "any" }}
      aria-labelledby="modal-title"
      className="fixed inset-0 m-auto w-[92%] max-w-3xl max-h-[85vh] bg-seline-white rounded-seline-cards border border-seline-pearl-border p-0 shadow-seline-xl flex flex-col focus:outline-none backdrop:bg-seline-ink/20 backdrop:backdrop-blur-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b border-seline-pearl-border bg-seline-cream">
        <div className="flex-1 pr-6">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-seline-wash text-seline-ink border border-seline-pearl-border mb-2">
            Journal Article
          </span>
          <h2
            id="modal-title"
            className="text-lg font-display font-medium text-seline-ink leading-snug tracking-tight"
          >
            {article.title}
          </h2>
          {article.subtitle && (
            <p className="text-sm text-seline-slate mt-1 italic">
              {article.subtitle}
            </p>
          )}
        </div>
        <button
          onClick={() => dialogRef.current?.close()}
          className="flex items-center justify-center p-1.5 rounded-full border border-seline-pearl-border text-seline-slate hover:text-seline-ink hover:bg-seline-cream transition-all cursor-pointer focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-seline-pearl-border bg-seline-cream text-xs">
        <button
          onClick={() => setActiveTab("details")}
          className={`flex-1 py-3 font-medium border-b-2 text-center transition-all cursor-pointer ${
            activeTab === "details"
              ? "border-seline-blue text-seline-blue bg-seline-white"
              : "border-transparent text-seline-slate hover:text-seline-ink hover:bg-seline-cream"
          }`}
        >
          Details
        </button>
        <button
          onClick={() => setActiveTab("citations")}
          className={`flex-1 py-3 font-medium border-b-2 text-center transition-all cursor-pointer ${
            activeTab === "citations"
              ? "border-seline-blue text-seline-blue bg-seline-white"
              : "border-transparent text-seline-slate hover:text-seline-ink hover:bg-seline-cream"
          }`}
        >
          Citing Articles ({citingArticles.length})
        </button>
        <button
          onClick={() => setActiveTab("references")}
          className={`flex-1 py-3 font-medium border-b-2 text-center transition-all cursor-pointer ${
            activeTab === "references"
              ? "border-seline-blue text-seline-blue bg-seline-white"
              : "border-transparent text-seline-slate hover:text-seline-ink hover:bg-seline-cream"
          }`}
        >
          References ({article.references?.length || article.referencesCount || 0})
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "details" ? (
          <div className="space-y-6">
            {/* Authors Section */}
            {article.authors && article.authors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-seline-slate uppercase tracking-wider flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-seline-blue" />
                  <span>Authors</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {article.authors.map((author, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-seline-pearl-border bg-seline-cream text-xs"
                    >
                      <span className="font-semibold text-seline-ink">{author.name}</span>
                      {author.orcid && (
                        <a
                          href={author.orcid.startsWith("http") ? author.orcid : `https://orcid.org/${author.orcid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-seline-blue hover:underline font-semibold text-[10px] px-1.5 py-0.5 rounded bg-seline-wash border border-seline-pearl-border"
                        >
                          <span>ORCID</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Abstract */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-seline-slate uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-seline-blue" />
                <span>Abstract</span>
              </h4>
              {abstractText ? (
                <p className="text-sm text-seline-ink leading-relaxed text-justify bg-seline-cream p-4 rounded-seline-inputs border border-seline-pearl-border">
                  {abstractText}
                </p>
              ) : (
                <p className="text-sm text-seline-slate italic">
                  No abstract deposited in Crossref metadata.
                </p>
              )}
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Publication Context */}
              <div className="p-4 rounded-seline-cards border border-seline-pearl-border space-y-3">
                <h5 className="text-xs font-medium text-seline-blue uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Publication Context</span>
                </h5>
                <ul className="text-xs space-y-2 text-seline-slate">
                  <li>
                    <strong className="font-medium text-seline-ink">Journal:</strong>{" "}
                    {article.journal}
                  </li>
                  {article.publisher && (
                    <li>
                      <strong className="font-medium text-seline-ink">Publisher:</strong>{" "}
                      {article.publisher}
                    </li>
                  )}
                  {(article.volume || article.issue || article.page || article.articleNumber) && (
                    <li>
                      <strong className="font-medium text-seline-ink">Metadata:</strong>{" "}
                      {article.volume && `Vol. ${article.volume}`}
                      {article.issue && `, No. ${article.issue}`}
                      {article.page && `, pp. ${article.page}`}
                      {article.articleNumber && `, Art. ${article.articleNumber}`}
                    </li>
                  )}
                  {identifiers.length > 0 && (
                    <li>
                      <strong className="font-medium text-seline-ink">Identifiers:</strong>{" "}
                      {identifiers.join(" | ")}
                    </li>
                  )}
                  {article.language && (
                    <li>
                      <strong className="font-medium text-seline-ink">Language:</strong>{" "}
                      {article.language.toUpperCase()}
                    </li>
                  )}
                </ul>
              </div>

              {/* Citations & Dates */}
              <div className="p-4 rounded-seline-cards border border-seline-pearl-border space-y-3">
                <h5 className="text-xs font-medium text-seline-blue uppercase tracking-wider flex items-center gap-1.5">
                  <Quote className="h-3.5 w-3.5" />
                  <span>Citations & History</span>
                </h5>
                <ul className="text-xs space-y-2 text-seline-slate">
                  <li className="flex items-center gap-3">
                    <span>
                      <strong className="font-medium text-seline-ink">Crossref Cited By:</strong>{" "}
                      <span className="px-2 py-0.5 bg-seline-wash text-seline-ink font-semibold rounded">
                        {article.citedByCount ?? 0}
                      </span>
                    </span>
                  </li>
                  <li>
                    <strong className="font-medium text-seline-ink">Published Date:</strong>{" "}
                    {formatDate(article.publishedDate)}
                  </li>
                  {article.createdDate && (
                    <li>
                      <strong className="font-medium text-seline-ink">Record Created:</strong>{" "}
                      {formatDate(article.createdDate)}
                    </li>
                  )}
                  {article.depositedDate && (
                    <li>
                      <strong className="font-medium text-seline-ink">Last Deposited:</strong>{" "}
                      {formatDate(article.depositedDate)}
                    </li>
                  )}
                  {article.indexedDate && (
                    <li>
                      <strong className="font-medium text-seline-ink">Last Indexed:</strong>{" "}
                      {formatDate(article.indexedDate)}
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* License Block */}
            {licenseUrl ? (
              <div className="flex items-center justify-between p-4 bg-seline-cream border border-seline-pearl-border rounded-seline-cards">
                <div className="flex items-center gap-2 text-xs text-seline-slate font-medium">
                  <BadgeCheck className="h-4 w-4 text-seline-blue" />
                  <span>
                    License: <strong className="font-semibold text-seline-ink">{getLicenseName(licenseUrl)}</strong>
                  </span>
                </div>
                <a
                  href={licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-seline-blue hover:underline font-semibold"
                >
                  <span>View License</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-seline-cream border border-seline-pearl-border rounded-seline-cards">
                <div className="flex items-center gap-2 text-xs text-seline-slate font-semibold">
                  <span className="w-2 h-2 rounded-full bg-seline-blue animate-pulse"></span>
                  <span>No license deposited in Crossref metadata</span>
                </div>
                <span className="text-[10px] text-seline-slate font-semibold uppercase tracking-wider">
                  Info
                </span>
              </div>
            )}
          </div>
        ) : activeTab === "citations" ? (
          <div className="space-y-4">
            {/* Search filter for citing articles */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search citing articles by title, authors, or journal..."
                value={citingSearchQuery}
                onChange={(e) => setCitingSearchQuery(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-seline-inputs border border-seline-warm-border bg-seline-white text-seline-ink focus:outline-none focus:border-seline-blue focus:ring-1 focus:ring-seline-blue transition-all h-[36px]"
              />
              {citingSearchQuery && (
                <button
                  onClick={() => setCitingSearchQuery("")}
                  className="px-3 py-2 text-xs font-medium bg-seline-cream hover:bg-seline-pearl-border text-seline-slate rounded-seline-inputs transition-all cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Citations Count */}
            <div className="text-xs font-semibold text-seline-slate">
              Crossref Cited-by: {citingArticles.length} citing articles found
            </div>

            {/* List / Table */}
            {sortedAndFilteredCitingArticles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-2 border border-dashed border-seline-pearl-border rounded-seline-cards bg-seline-cream">
                <Quote className="h-8 w-8 text-seline-soft-slate" />
                <p className="text-xs font-medium text-seline-slate">
                  {citingArticles.length === 0
                    ? "No citing articles found in Crossref Cited-by for this DOI."
                    : "No matching citing articles found."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-seline-pearl-border rounded-seline-cards bg-seline-white">
                <table className="min-w-full divide-y divide-seline-pearl-border text-left text-[11px] leading-normal">
                  <thead className="bg-seline-cream font-medium text-seline-slate uppercase tracking-wider text-[9px]">
                    <tr>
                      <th className="px-4 py-3 text-center w-20">
                        <button
                          onClick={() => handleSort("year")}
                          className="inline-flex items-center justify-center gap-1 hover:text-seline-blue font-medium cursor-pointer focus:outline-none w-full"
                        >
                          <span>Year</span>
                          {sortField === "year" ? (
                            sortDirection === "asc" ? (
                              <ArrowUp className="h-3 w-3 text-seline-blue" />
                            ) : (
                              <ArrowDown className="h-3 w-3 text-seline-blue" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3 text-seline-soft-slate" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3">Citing Article</th>
                      <th className="px-4 py-3">
                        <button
                          onClick={() => handleSort("journal")}
                          className="inline-flex items-center gap-1 hover:text-seline-blue font-medium cursor-pointer focus:outline-none"
                        >
                          <span>Citing Journal</span>
                          {sortField === "journal" ? (
                            sortDirection === "asc" ? (
                              <ArrowUp className="h-3 w-3 text-seline-blue" />
                            ) : (
                              <ArrowDown className="h-3 w-3 text-seline-blue" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3 text-seline-soft-slate" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3">Authors</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-seline-pearl-border text-seline-ink">
                    {sortedAndFilteredCitingArticles.map((cit, idx) => (
                      <tr key={idx} className="hover:bg-seline-cream/50 transition-colors">
                        <td className="px-4 py-3 text-center font-semibold text-seline-ink">
                          {cit.citingYear || "—"}
                        </td>
                        <td className="px-4 py-3 font-semibold text-seline-ink break-words max-w-xs">
                          {cit.citingTitle}
                        </td>
                        <td className="px-4 py-3 italic text-seline-slate break-words max-w-xs">
                          {cit.citingJournal}
                        </td>
                        <td className="px-4 py-3 text-seline-slate break-words max-w-xs">
                          {cit.citingAuthors?.join(", ") || "Unknown Author"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-1.5 py-0.5 rounded bg-seline-cream border border-seline-pearl-border text-[9px] font-semibold text-seline-slate uppercase tracking-wider">
                            {cit.citingType?.replace("-", " ") || "Article"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <a
                            href={cit.citingDoiUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-seline-blue hover:underline underline-offset-1"
                          >
                            <span>Open DOI</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Caveat */}
            <div className="p-3.5 rounded-seline-inputs border border-seline-pearl-border bg-seline-cream text-[10px] text-seline-slate leading-relaxed italic">
              Crossref Cited-by reflects citation links matched from references deposited to Crossref. It may differ from Scopus, Web of Science, SINTA, Google Scholar, or Dimensions.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search filter for references */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search references by author, title, journal, or DOI..."
                value={refSearchQuery}
                onChange={(e) => setRefSearchQuery(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-seline-inputs border border-seline-warm-border bg-seline-white text-seline-ink focus:outline-none focus:border-seline-blue focus:ring-1 focus:ring-seline-blue transition-all h-[36px]"
              />
              {refSearchQuery && (
                <button
                  onClick={() => setRefSearchQuery("")}
                  className="px-3 py-2 text-xs font-medium bg-seline-cream hover:bg-seline-pearl-border text-seline-slate rounded-seline-inputs transition-all cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* References Count */}
            <div className="text-xs font-semibold text-seline-slate">
              Crossref: {article.references?.length || 0} references found
            </div>

            {/* References List */}
            {filteredReferences.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-2 border border-dashed border-seline-pearl-border rounded-seline-cards bg-seline-cream">
                <BookOpen className="h-8 w-8 text-seline-soft-slate" />
                <p className="text-xs font-medium text-seline-slate">
                  {!article.references || article.references.length === 0
                    ? "No references deposited in Crossref metadata for this article."
                    : "No matching references found."}
                </p>
              </div>
            ) : (
              <div className="border border-seline-pearl-border rounded-seline-cards bg-seline-white divide-y divide-seline-pearl-border max-h-[40vh] overflow-y-auto">
                {filteredReferences.map((ref, idx) => {
                  const refIndex = (article.references?.indexOf(ref) ?? idx) + 1;
                  return (
                    <div key={ref.key || idx} className="p-4 hover:bg-seline-cream/30 transition-colors text-xs flex gap-3 items-start">
                      <span className="text-seline-soft-slate font-mono text-[10px] w-6 text-right shrink-0 mt-0.5">
                        [{refIndex}]
                      </span>
                      <div className="space-y-1.5 flex-1 min-w-0">
                        {ref.unstructured ? (
                          <p className="text-seline-ink leading-relaxed text-justify break-words">
                            {ref.unstructured}
                          </p>
                        ) : (
                          <p className="text-seline-slate italic">
                            Unstructured citation text not available.
                          </p>
                        )}
                        {ref.doi && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-seline-slate shrink-0">DOI: {ref.doi}</span>
                            <a
                              href={`https://doi.org/${ref.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-0.5 font-semibold text-seline-blue hover:underline"
                            >
                              <span className="text-[10px]">Open DOI</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Disclaimer */}
            <div className="p-3.5 rounded-seline-inputs border border-seline-pearl-border bg-seline-cream text-[10px] text-seline-slate leading-relaxed italic">
              References list is extracted from Crossref metadata deposited by the publisher. If the list is empty, it means the publisher did not deposit references metadata for this article or the data was not captured in the sync.
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between p-5 border-t border-seline-pearl-border bg-seline-cream">
        <div className="text-xs text-seline-slate font-mono select-all break-all pr-4">
          DOI: {article.doi}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => dialogRef.current?.close()}
            className="px-4 py-2 text-xs font-semibold text-seline-slate hover:bg-seline-cream border border-seline-pearl-border rounded-full transition-all cursor-pointer focus:outline-none"
          >
            Close
          </button>
          
          {article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-seline-slate hover:text-seline-ink bg-seline-white hover:bg-seline-cream border border-seline-pearl-border rounded-full transition-all focus:outline-none cursor-pointer"
            >
              <span>Open Full Text</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          
          <a
            href={article.doiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-seline-white bg-seline-blue hover:opacity-90 rounded-full transition-all focus:outline-none cursor-pointer"
          >
            <span>Open DOI</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </dialog>
  );
};
