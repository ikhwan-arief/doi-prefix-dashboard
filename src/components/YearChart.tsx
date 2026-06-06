/**
 * DOI Prefix Publication Dashboard - Year Chart Component
 * Creator: Ikhwan Arief (ikhwan[at]unand.ac.id)
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
import type { ByYearData } from "../lib/types";

interface YearChartProps {
  data: ByYearData[];
}

export const YearChart: React.FC<YearChartProps> = ({ data }) => {
  // Ensure we sort by year ascending for chronological chart presentation
  const sortedData = [...data].sort((a, b) => {
    if (a.year === "Unknown") return 1;
    if (b.year === "Unknown") return -1;
    return Number(a.year) - Number(b.year);
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 p-5 shadow-sm flex flex-col h-[350px]">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-white">
          Publications over Time
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Distribution of publications by year
        </p>
      </div>

      <div className="h-[260px] w-full">
        {sortedData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            No year data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="yearGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="#0369a1" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
                className="dark:stroke-slate-800"
              />
              <XAxis
                dataKey="year"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(224, 242, 254, 0.15)" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-3 rounded-xl shadow-lg text-xs">
                        <p className="font-semibold text-slate-500 dark:text-slate-400">
                          Year: {payload[0].payload.year}
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
                fill="url(#yearGradient)"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
