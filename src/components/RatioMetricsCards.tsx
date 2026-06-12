/**
 * DOI Prefix Publication Dashboard - Ratio Metrics Cards Component
 * Redesigned to Seline Analytics Style Guidelines
 */

import React, { useMemo } from "react";
import { TrendingUp, Award, Info } from "lucide-react";
import type { Article } from "../lib/types";

interface RatioMetricsCardsProps {
  articles: Article[];
}

export const RatioMetricsCards: React.FC<RatioMetricsCardsProps> = ({ articles }) => {
  const stats = useMemo(() => {
    if (!articles.length) {
      return {
        totalArticles: 0,
        totalCitations: 0,
        citationsPerArticle: 0,
        avgJournalCitationsPerArticle: 0,
        journalCount: 0,
      };
    }

    const totalArticles = articles.length;
    let totalCitations = 0;
    const journalStatsMap: Record<string, { count: number; citations: number }> = {};

    articles.forEach((art) => {
      const cited = art.citedByCount || 0;
      totalCitations += cited;

      const jr = art.journal || "Unknown Journal";
      if (!journalStatsMap[jr]) {
        journalStatsMap[jr] = { count: 0, citations: 0 };
      }
      journalStatsMap[jr].count += 1;
      journalStatsMap[jr].citations += cited;
    });

    const citationsPerArticle = totalCitations / totalArticles;

    const journalAverages = Object.values(journalStatsMap).map(
      (j) => j.citations / j.count
    );
    const avgJournalCitationsPerArticle =
      journalAverages.reduce((sum, val) => sum + val, 0) / journalAverages.length;

    return {
      totalArticles,
      totalCitations,
      citationsPerArticle,
      avgJournalCitationsPerArticle,
      journalCount: journalAverages.length,
    };
  }, [articles]);

  const formatNumber = (num: number, decimals: number = 3) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatCount = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Metric 1: Citations per Article */}
      <div className="bg-seline-white border border-seline-pearl-border rounded-seline-cards p-6 shadow-seline-sm hover:shadow-seline-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[11px] font-medium tracking-wider text-seline-slate uppercase">
                Citations per Article Ratio
              </span>
              <h4 className="text-4xl font-display font-medium tracking-tight text-seline-ink">
                {formatNumber(stats.citationsPerArticle)}
              </h4>
            </div>
            <div className="p-2.5 rounded-full bg-seline-wash text-seline-blue">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

          <div className="pt-4 border-t border-seline-pearl-border flex flex-col gap-1.5 text-xs text-seline-slate">
            <div className="flex items-center gap-1.5 font-medium text-seline-ink">
              <Info className="h-3.5 w-3.5 text-seline-blue" />
              Formula: Total Citations / Total Articles
            </div>
            <p className="leading-relaxed">
              Calculated from {formatCount(stats.totalCitations)} total citations divided by {formatCount(stats.totalArticles)} total articles under this prefix.
            </p>
          </div>
        </div>
      </div>

      {/* Metric 2: Average Citations per Journal */}
      <div className="bg-seline-white border border-seline-pearl-border rounded-seline-cards p-6 shadow-seline-sm hover:shadow-seline-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[11px] font-medium tracking-wider text-seline-slate uppercase">
                Average Citations per Journal
              </span>
              <h4 className="text-4xl font-display font-medium tracking-tight text-seline-ink">
                {formatNumber(stats.avgJournalCitationsPerArticle)}
              </h4>
            </div>
            <div className="p-2.5 rounded-full bg-seline-wash text-seline-blue">
              <Award className="h-5 w-5" />
            </div>
          </div>

          <div className="pt-4 border-t border-seline-pearl-border flex flex-col gap-1.5 text-xs text-seline-slate">
            <div className="flex items-center gap-1.5 font-medium text-seline-ink">
              <Info className="h-3.5 w-3.5 text-seline-blue" />
              Formula: Mean of all journals' average citations per article
            </div>
            <p className="leading-relaxed">
              Average of the average citations per article across each of the {formatCount(stats.journalCount)} journals under this prefix.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
