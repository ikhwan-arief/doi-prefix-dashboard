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
    <div className="bg-seline-white rounded-seline-cards border border-seline-pearl-border p-5 shadow-seline-sm flex flex-col h-[350px]">
      <div className="mb-4">
        <h3 className="text-base font-display font-medium text-seline-ink">
          Most Active Authors
        </h3>
        <p className="text-xs text-seline-slate">
          Top 10 authors sorted by total registered publications
        </p>
      </div>

      <div className="h-[250px] w-full">
        {top10Authors.length === 0 ? (
          <div className="h-full flex items-center justify-center text-seline-slate text-sm">
            No author data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={top10Authors}
              layout="vertical"
              margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#e5e7eb"
              />
              <XAxis
                type="number"
                stroke="#78716c"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#78716c"
                fontSize={11}
                tickFormatter={formatAuthorTick}
                width={150}
                tickLine={false}
                axisLine={false}
                interval={0}
              />
              <Tooltip
                cursor={{ fill: "rgba(193, 225, 247, 0.15)" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-seline-white border border-seline-pearl-border p-3 rounded-md shadow-seline-sm text-xs max-w-[280px] break-words">
                        <p className="font-medium text-seline-blue mb-1">
                          {payload[0].payload.name}
                        </p>
                        <p className="font-medium text-seline-ink mt-1">
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
                fill="#3ba6f1"
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
