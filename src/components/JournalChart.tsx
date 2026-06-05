/**
 * DOI Prefix Publication Dashboard - Journal Chart Component
 * Creator: Ikhwan Arief (ikhwan@unand.ac.id)
 */

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ByJournalData } from "../lib/types";

interface JournalChartProps {
  data: ByJournalData[];
}

export const JournalChart: React.FC<JournalChartProps> = ({ data }) => {
  // Take top 20 journals by default as requested
  const top20Data = data.slice(0, 20);

  const formatJournalTick = (tick: string) => {
    if (tick.length > 25) {
      return `${tick.substring(0, 22)}...`;
    }
    return tick;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 p-5 shadow-sm flex flex-col h-[480px]">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-white">
          Top Journals
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Distribution across top 20 journals by article count
        </p>
      </div>

      <div className="flex-1 min-h-0 w-full">
        {top20Data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            No journal data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={top20Data}
              layout="vertical"
              margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="journalGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3} />
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
                dataKey="journal"
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={formatJournalTick}
                width={150}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(99, 102, 241, 0.08)" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-3 rounded-xl shadow-lg text-xs max-w-[280px] break-words">
                        <p className="font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                          {payload[0].payload.journal}
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
                fill="url(#journalGradient)"
                radius={[0, 4, 4, 0]}
                maxBarSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
