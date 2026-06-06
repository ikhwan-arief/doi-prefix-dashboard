/**
 * DOI Prefix Publication Dashboard - Ratio Metrics Cards Component
 * Creator: Ikhwan Arief (ikhwan[at]unand.ac.id)
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
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 text-white rounded-3xl p-6 shadow-lg shadow-indigo-500/10 hover:shadow-xl hover:shadow-indigo-500/15 hover:-translate-y-0.5 transition-all duration-300 group border border-indigo-400/10">
        {/* Decorative background shapes */}
        <div className="absolute -right-10 -bottom-10 h-36 w-36 bg-white/5 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500"></div>
        <div className="absolute right-6 top-6 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-inner">
          <TrendingUp className="h-6 w-6 text-indigo-100" />
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-indigo-200 uppercase">
              Citations per Article Ratio
            </span>
            <h4 className="text-4xl font-extrabold tracking-tight">
              {formatNumber(stats.citationsPerArticle)}
            </h4>
          </div>

          <div className="pt-2 border-t border-white/10 flex flex-col gap-1.5 text-xs text-indigo-100/90">
            <div className="flex items-center gap-1.5 font-medium">
              <Info className="h-3.5 w-3.5 opacity-80" />
              Formula: Total Citations / Total Articles
            </div>
            <p className="opacity-75 leading-relaxed">
              Calculated from {formatCount(stats.totalCitations)} total citations divided by {formatCount(stats.totalArticles)} total articles under this prefix.
            </p>
          </div>
        </div>
      </div>

      {/* Metric 2: Average Citations per Journal */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white rounded-3xl p-6 shadow-lg shadow-emerald-500/10 hover:shadow-xl hover:shadow-emerald-500/15 hover:-translate-y-0.5 transition-all duration-300 group border border-emerald-400/10">
        {/* Decorative background shapes */}
        <div className="absolute -right-10 -bottom-10 h-36 w-36 bg-white/5 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500"></div>
        <div className="absolute right-6 top-6 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-inner">
          <Award className="h-6 w-6 text-emerald-100" />
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-emerald-200 uppercase">
              Average Citations per Journal
            </span>
            <h4 className="text-4xl font-extrabold tracking-tight">
              {formatNumber(stats.avgJournalCitationsPerArticle)}
            </h4>
          </div>

          <div className="pt-2 border-t border-white/10 flex flex-col gap-1.5 text-xs text-emerald-100/90">
            <div className="flex items-center gap-1.5 font-medium">
              <Info className="h-3.5 w-3.5 opacity-80" />
              Formula: Mean of all journals' average citations per article
            </div>
            <p className="opacity-75 leading-relaxed">
              Average of the average citations per article across each of the {formatCount(stats.journalCount)} journals under this prefix.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
