/**
 * DOI Prefix Publication Dashboard - Journal Chart Component
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
import type { ByJournalData } from "../lib/types";

const journalUrls: Record<string, string> = {
  "jurnal fisika unand": "https://jfu.fmipa.unand.ac.id/",
  "jurnal sains farmasi & klinis": "http://jsfk.ffarmasi.unand.ac.id/",
  "jurnal optimasi sistem industri": "http://josi.ft.unand.ac.id/",
  "majalah kedokteran andalas": "http://jurnalmka.fk.unand.ac.id/",
  "jurnal nasional teknik elektro": "https://jnte.ft.unand.ac.id/",
  "jurnal kesehatan andalas": "http://jurnal.fk.unand.ac.id/",
  "logista": "http://logista.fateta.unand.ac.id/",
  "logista - jurnal ilmiah pengabdian kepada masyarakat": "http://logista.fateta.unand.ac.id/",
  "teknosi": "https://teknosi.fti.unand.ac.id/",
  "jurnal nasional teknologi dan sistem informasi": "https://teknosi.fti.unand.ac.id/",
  "buletin ilmiah nagari": "https://buletinnagari.lppm.unand.ac.id",
  "buletin ilmiah nagari membangun": "https://buletinnagari.lppm.unand.ac.id",
  "jurnal ilmu fisika": "https://jif.fmipa.unand.ac.id",
  "jurnal ilmu kesehatan indonesia": "https://jikesi.fk.unand.ac.id",
  "jurnal ilmu kesehatan": "https://jikesi.fk.unand.ac.id",
  "jurnal arbitrer": "https://arbitrer.fib.unand.ac.id/",
  "arbitrer": "https://arbitrer.fib.unand.ac.id/"
};

const getJournalUrl = (name: string) => {
  const cleanName = name.toLowerCase().trim();
  if (journalUrls[cleanName]) return journalUrls[cleanName];
  
  for (const [key, value] of Object.entries(journalUrls)) {
    if (cleanName.includes(key) || key.includes(cleanName)) {
      return value;
    }
  }
  return `https://ejournal.unand.ac.id/`;
};

const formatJournalTick = (tick: string) => {
  if (tick.length > 35) {
    return `${tick.substring(0, 32)}...`;
  }
  return tick;
};

const CustomYAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const name = payload.value;
  const url = getJournalUrl(name);
  const formattedName = formatJournalTick(name);
  
  return (
    <g transform={`translate(${x},${y})`}>
      <a href={url} target="_blank" rel="noopener noreferrer">
        <text
          x={-10}
          y={4}
          textAnchor="end"
          fontSize={11}
          className="fill-slate-500 dark:fill-slate-400 hover:fill-indigo-600 dark:hover:fill-indigo-400 hover:font-bold transition-all duration-150 cursor-pointer select-none"
          style={{ cursor: "pointer" }}
        >
          {formattedName}
        </text>
      </a>
    </g>
  );
};

interface JournalChartProps {
  data: ByJournalData[];
}

export const JournalChart: React.FC<JournalChartProps> = ({ data }) => {
  // Take top 20 journals by default as requested
  const top20Data = data.slice(0, 20);

  const handleBarClick = (entry: any) => {
    if (entry && entry.journal) {
      const url = getJournalUrl(entry.journal);
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 p-5 shadow-sm flex flex-col h-[725px]">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-white">
          Top Journals
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Distribution across top 20 journals by article count (Click label or bar to open website)
        </p>
      </div>

      <div className="h-[625px] w-full">
        {top20Data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            No journal data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={top20Data}
              layout="vertical"
              margin={{ top: 5, right: 15, left: 20, bottom: 5 }}
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
                width={225}
                interval={0}
                tickLine={false}
                axisLine={false}
                tick={<CustomYAxisTick />}
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
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 border-t border-slate-100 dark:border-slate-800 pt-1.5 italic">
                          Click label or bar to open journal website ↗
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
                style={{ cursor: "pointer" }}
                onClick={(state) => handleBarClick(state)}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
