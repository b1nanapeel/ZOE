"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import type { TrendItem } from "@/lib/patterns";
import { PatternEmpty } from "./EmptyState";

export function TrendList({ trends }: { trends: TrendItem[] }) {
  if (trends.length === 0) {
    return (
      <PatternEmpty message="Trends appear after a behavior is tagged 5 or more times." />
    );
  }
  return (
    <ul className="space-y-2">
      {trends.map((t) => (
        <li
          key={t.behavior}
          className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white p-3"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-900">
              {t.behavior}
            </p>
            <p className="font-mono text-xs text-neutral-500">
              {t.totalOccurrences} clips
            </p>
          </div>

          <div className="h-10 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={t.spark.map((v, i) => ({ i, v }))}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              t.direction === "increasing"
                ? "text-emerald-600"
                : t.direction === "decreasing"
                  ? "text-red-600"
                  : "text-neutral-500"
            }`}
          >
            {t.direction === "increasing" ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : t.direction === "decreasing" ? (
              <ArrowDownRight className="h-4 w-4" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            <span className="font-mono">
              {t.percentChange > 0 ? "+" : ""}
              {t.percentChange}%
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
