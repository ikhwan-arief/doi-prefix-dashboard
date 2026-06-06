/**
 * DOI Prefix Publication Dashboard - Author Chart Component
 * Creator: Ikhwan Arief (ikhwan[at]unand.ac.id)
 */

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Article } from "../lib/types";

interface AuthorChartProps {
  articles: Article[];
}

export const AuthorChart: React.FC<AuthorChartProps> = ({ articles }) => {
  const top10Authors = useMemo(() => {
    const counts: Record<string, number> = {};
    
    articles.forEach((art) => {
      if (art.authors) {
        art.authors.forEach((author) => {
          const name = author.name || `${author.given || ""} ${author.family || ""}`.trim();
          if (name && name !== "Unknown Author") {
            counts[name] = (counts[name] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [articles]);

  const formatAuthorTick = (tick: string) => {
    if (tick.length > 25) {
      return `${tick.substring(0, 22)}...`;
    }
    return tick;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 p-5 shadow-sm flex flex-col h-[350px]">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-white">
          Most Active Authors
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Top 10 authors sorted by total registered publications
        </p>
      </div>

      <div className="h-[250px] w-full">
        {top10Authors.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            No author data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={top10Authors}
              layout="vertical"
              margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="authorGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#f1f5f9"
                className="dark:stroke-slate-800"
              />
              <XAxis
                type="number"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={formatAuthorTick}
                width={150}
                tickLine={false}
                axisLine={false}
                interval={0}
              />
              <Tooltip
                cursor={{ fill: "rgba(139, 92, 246, 0.08)" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-slate-955 border border-slate-100 dark:border-slate-800 p-3 rounded-xl shadow-lg text-xs max-w-[280px] break-words">
                        <p className="font-semibold text-violet-600 dark:text-violet-400 mb-1">
                          {payload[0].payload.name}
                        </p>
                        <p className="font-bold text-slate-800 dark:text-white mt-1">
                          {payload[0].value} Publications
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="count"
                fill="url(#authorGradient)"
                radius={[0, 4, 4, 0]}
                maxBarSize={18}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
