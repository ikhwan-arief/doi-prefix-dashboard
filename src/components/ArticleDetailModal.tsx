/**
 * DOI Prefix Publication Dashboard - Article Detail Modal Component
 * Creator: Ikhwan Arief (ikhwan@unand.ac.id)
 */

import React, { useEffect, useRef } from "react";
import { X, ExternalLink, BookOpen, Quote, User, FileText, BadgeCheck } from "lucide-react";
import type { Article } from "../lib/types";
import { stripHtml, formatDate } from "../lib/normalize";

const getLicenseName = (url?: string): string => {
  if (!url) return "No License";
  const lower = url.toLowerCase();
  
  if (lower.includes("creativecommons.org/licenses/")) {
    const match = lower.match(/\/licenses\/([a-z\-]+)\/([0-9\.]+)/);
    if (match) {
      const code = match[1].toUpperCase();
      const version = match[2];
      return `Creative Commons CC ${code} ${version}`;
    }
    return "Creative Commons License";
  }
  
  if (lower.includes("creativecommons.org/publicdomain/zero/1.0")) {
    return "CC0 1.0 Universal (Public Domain)";
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
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({ article, onClose }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

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
      // Pass custom closedby attribute to support declarative light-dismiss
      {...{ closedby: "any" }}
      aria-labelledby="modal-title"
      className="fixed inset-0 m-auto w-[92%] max-w-3xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-0 shadow-2xl flex flex-col focus:outline-none backdrop:bg-slate-900/60 backdrop:backdrop-blur-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
        <div className="flex-1 pr-6">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/30 mb-2">
            Journal Article
          </span>
          <h2
            id="modal-title"
            className="text-lg font-bold text-slate-800 dark:text-white leading-snug"
          >
            {article.title}
          </h2>
          {article.subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 italic">
              {article.subtitle}
            </p>
          )}
        </div>
        <button
          onClick={() => dialogRef.current?.close()}
          className="flex items-center justify-center p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Authors Section */}
        {article.authors && article.authors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              <span>Authors</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {article.authors.map((author, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{author.name}</span>
                  {author.orcid && (
                    <a
                      href={author.orcid.startsWith("http") ? author.orcid : `https://orcid.org/${author.orcid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/20"
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
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            <span>Abstract</span>
          </h4>
          {abstractText ? (
            <p className="text-sm text-slate-700 dark:text-slate-350 leading-relaxed text-justify bg-slate-50/30 dark:bg-slate-950/10 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
              {abstractText}
            </p>
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500 italic">
              No abstract deposited in Crossref metadata.
            </p>
          )}
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Publication Context */}
          <div className="p-4 rounded-xl border border-slate-150 dark:border-slate-850 space-y-3">
            <h5 className="text-xs font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Publication Context</span>
            </h5>
            <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
              <li>
                <strong className="font-semibold text-slate-500 dark:text-slate-400">Journal:</strong>{" "}
                {article.journal}
              </li>
              {article.publisher && (
                <li>
                  <strong className="font-semibold text-slate-500 dark:text-slate-400">Publisher:</strong>{" "}
                  {article.publisher}
                </li>
              )}
              {(article.volume || article.issue || article.page || article.articleNumber) && (
                <li>
                  <strong className="font-semibold text-slate-500 dark:text-slate-400">Metadata:</strong>{" "}
                  {article.volume && `Vol. ${article.volume}`}
                  {article.issue && `, No. ${article.issue}`}
                  {article.page && `, pp. ${article.page}`}
                  {article.articleNumber && `, Art. ${article.articleNumber}`}
                </li>
              )}
              {identifiers.length > 0 && (
                <li>
                  <strong className="font-semibold text-slate-500 dark:text-slate-400">Identifiers:</strong>{" "}
                  {identifiers.join(" | ")}
                </li>
              )}
              {article.language && (
                <li>
                  <strong className="font-semibold text-slate-500 dark:text-slate-400">Language:</strong>{" "}
                  {article.language.toUpperCase()}
                </li>
              )}
            </ul>
          </div>

          {/* Citations & Dates */}
          <div className="p-4 rounded-xl border border-slate-150 dark:border-slate-850 space-y-3">
            <h5 className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
              <Quote className="h-3.5 w-3.5" />
              <span>Citations & History</span>
            </h5>
            <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-3">
                <span>
                  <strong className="font-semibold text-slate-500 dark:text-slate-400">Crossref Cited By:</strong>{" "}
                  <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/35 text-emerald-600 dark:text-emerald-400 font-bold rounded">
                    {article.citedByCount ?? 0}
                  </span>
                </span>
              </li>
              <li>
                <strong className="font-semibold text-slate-500 dark:text-slate-400">Published Date:</strong>{" "}
                {formatDate(article.publishedDate)}
              </li>
              {article.createdDate && (
                <li>
                  <strong className="font-semibold text-slate-500 dark:text-slate-400">Record Created:</strong>{" "}
                  {formatDate(article.createdDate)}
                </li>
              )}
              {article.depositedDate && (
                <li>
                  <strong className="font-semibold text-slate-500 dark:text-slate-400">Last Deposited:</strong>{" "}
                  {formatDate(article.depositedDate)}
                </li>
              )}
              {article.indexedDate && (
                <li>
                  <strong className="font-semibold text-slate-500 dark:text-slate-400">Last Indexed:</strong>{" "}
                  {formatDate(article.indexedDate)}
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* License Block */}
        {licenseUrl ? (
          <div className="flex items-center justify-between p-4 bg-emerald-50/30 dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
            <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
              <BadgeCheck className="h-4 w-4 text-emerald-500" />
              <span>
                License: <strong className="font-bold text-emerald-800 dark:text-emerald-200">{getLicenseName(licenseUrl)}</strong>
              </span>
            </div>
            <a
              href={licenseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-450 dark:hover:text-emerald-350 font-bold underline underline-offset-2"
            >
              <span>View License</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-red-50/50 dark:bg-red-950/20 border border-red-150 dark:border-red-900/40 rounded-xl">
            <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span>No license deposited in Crossref metadata</span>
            </div>
            <span className="text-[10px] text-red-650 dark:text-red-400 font-extrabold uppercase tracking-wider">
              Warning
            </span>
          </div>
        )}

      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono select-all break-all pr-4">
          DOI: {article.doi}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => dialogRef.current?.close()}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all cursor-pointer focus:outline-none"
          >
            Close
          </button>
          
          {article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-850 rounded-xl transition-all focus:outline-none cursor-pointer"
            >
              <span>Open Full Text</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          
          <a
            href={article.doiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition-all focus:outline-none cursor-pointer"
          >
            <span>Open DOI</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </dialog>
  );
};
