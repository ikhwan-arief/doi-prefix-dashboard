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
    <div className="bg-seline-white rounded-seline-cards border border-seline-pearl-border p-5 shadow-seline-sm flex flex-col h-[350px]">
      <div className="mb-4">
        <h3 className="text-base font-display font-medium text-seline-ink">
          Publications over Time
        </h3>
        <p className="text-xs text-seline-slate">
          Distribution of publications by year
        </p>
      </div>

      <div className="h-[260px] w-full">
        {sortedData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-seline-slate text-sm">
            No year data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis
                dataKey="year"
                stroke="#78716c"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#78716c"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(193, 225, 247, 0.15)" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-seline-white border border-seline-pearl-border p-3 rounded-md shadow-seline-sm text-xs">
                        <p className="font-medium text-seline-slate">
                          Year: {payload[0].payload.year}
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
