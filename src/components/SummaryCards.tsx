/**
 * DOI Prefix Publication Dashboard - Summary Cards Component
 * Redesigned to Seline Analytics Stat Blocks
 */

import React from "react";
import { RefreshCw } from "lucide-react";
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
      description: "Registered publications in Crossref",
    },
    {
      title: "Total Journals",
      value: formatNumber(summary.totalJournals),
      description: "Active journals under prefix",
    },
    {
      title: "Total Citations",
      value: formatNumber(summary.totalCitationsInCrossref),
      description: "Cited-by counts on Crossref",
    },
    {
      title: "Year Range",
      value: `${summary.firstYear} – ${summary.latestYear}`,
      description: "Active deposit coverage period",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Blocks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-4">
        {cards.map((card, idx) => (
          <div key={idx} className="flex flex-col">
            <span className="text-[12px] font-medium text-seline-slate uppercase tracking-wider">
              {card.title}
            </span>
            <span className="text-4xl lg:text-[48px] font-display font-medium text-seline-ink tracking-tight mt-4 leading-none">
              {card.value}
            </span>
            <span className="text-xs text-seline-slate mt-2">
              {card.description}
            </span>
          </div>
        ))}
      </div>

      {/* Sync Status Info Card - Minimalist */}
      <div className="flex items-center gap-2 py-2 text-xs text-seline-slate border-t border-seline-pearl-border">
        <RefreshCw className="h-3.5 w-3.5 text-seline-slate animate-spin-slow" />
        <span>
          Last Sync: <strong className="font-medium text-seline-ink">{formatDate(summary.lastSync.substring(0, 10))} {summary.lastSync.substring(11, 16)} UTC</strong>
        </span>
      </div>
    </div>
  );
};
