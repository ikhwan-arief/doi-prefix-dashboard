import React from "react";
import { FileText, BookOpen, MessageSquare, Calendar, RefreshCw } from "lucide-react";
import type { DashboardSummary } from "../lib/types";
import { formatDate } from "../lib/normalize";

interface SummaryCardsProps {
  summary: DashboardSummary;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const cards = [
    {
      title: "Total Articles",
      value: formatNumber(summary.totalArticles),
      icon: <FileText className="h-6 w-6 text-sky-500" />,
      description: "Journal articles registered in Crossref",
      bgColor: "bg-sky-50/50 dark:bg-sky-950/20 border-sky-100 dark:border-sky-900/50",
    },
    {
      title: "Total Journals",
      value: formatNumber(summary.totalJournals),
      icon: <BookOpen className="h-6 w-6 text-indigo-500" />,
      description: "Distinct journals publishing under prefix",
      bgColor: "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/50",
    },
    {
      title: "Total Citations",
      value: formatNumber(summary.totalCitationsInCrossref),
      icon: <MessageSquare className="h-6 w-6 text-emerald-500" />,
      description: "Total cited-by counts on Crossref",
      bgColor: "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50",
    },
    {
      title: "Year Range",
      value: `${summary.firstYear} – ${summary.latestYear}`,
      icon: <Calendar className="h-6 w-6 text-amber-500" />,
      description: "Coverage period of active deposits",
      bgColor: "bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`flex flex-col p-5 rounded-2xl border transition-all duration-300 hover:shadow-md ${card.bgColor}`}
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {card.title}
            </span>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
              {card.icon}
            </div>
          </div>
          <span className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            {card.value}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {card.description}
          </span>
        </div>
      ))}

      {/* Sync Status Info Card (span full on tablet, single on desktop if needed, or we just put it as header or footer metadata) */}
      <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-3.5 w-3.5 text-slate-400 animate-spin-slow" />
          <span>
            Data Source: <strong className="font-semibold text-slate-700 dark:text-slate-300">{summary.source}</strong> (Prefix: <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[11px]">{summary.prefix}</code>)
          </span>
        </div>
        <div>
          Last Sync: <strong className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(summary.lastSync.substring(0, 10))} {summary.lastSync.substring(11, 16)} UTC</strong>
        </div>
      </div>
    </div>
  );
};
