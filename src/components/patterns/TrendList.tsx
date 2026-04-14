"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import type { TrendItem } from "@/lib/patterns";
import type { ResearchInsight } from "@/lib/research-search";
import { PatternEmpty } from "./EmptyState";
import { ResearchInsightCard } from "@/components/research/ResearchInsightCard";

export function TrendList({
  trends,
  insightsByBehavior = {},
}: {
  trends: TrendItem[];
  insightsByBehavior?: Record<string, ResearchInsight[]>;
}) {
  if (trends.length === 0) {
    return (
      <PatternEmpty message="Trends appear after a behavior is tagged 5 or more times." />
    );
  }
  return (
    <ul className="space-y-3">
      {trends.map((t) => {
        const insights = insightsByBehavior[t.behavior] ?? [];
        return (
          <li key={t.behavior} className="space-y-2">
            <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-100 p-3">
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
                      stroke="#c9a84c"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  t.direction === "increasing"
                    ? "text-secondary-700"
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
            </div>

            {insights.length > 0 && (
              <div className="ml-3 space-y-2">
                {insights.map((i, idx) => (
                  <ResearchInsightCard
                    key={`${t.behavior}-${idx}`}
                    insight={i}
                    behavioralQuery={t.behavior}
                    pageContext="patterns"
                  />
                ))}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
