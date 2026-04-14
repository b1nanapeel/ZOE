"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FrequencyResult } from "@/lib/patterns";
import { behaviorColor } from "@/lib/tag-helpers";
import { PatternEmpty } from "./EmptyState";

const COLOR: Record<string, string> = {
  communication: "#6892b0",
  movement: "#d4b35d",
  emotional: "#d68aa6",
  sensory: "#b09cd6",
  antecedent: "#8bacc4",
  consequence: "#c9a84c",
  neutral: "#8bacc4",
};

export function BehaviorFrequencyChart({
  data,
  weeks,
  onWeeksChange,
}: {
  data: FrequencyResult;
  weeks: number;
  onWeeksChange: (n: number) => void;
}) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const visibleBehaviors = data.topBehaviors.filter((b) => !hidden.has(b));

  const chartData = data.weeks.map((w) => {
    const row: Record<string, number | string> = { label: w.label };
    data.topBehaviors.forEach((b) => {
      row[b] = w.counts[b] ?? 0;
    });
    return row;
  });

  const hasData = data.topBehaviors.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-lg border border-neutral-200 bg-white p-0.5">
          {[4, 8, 12].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onWeeksChange(n)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                weeks === n
                  ? "bg-primary-500 text-white"
                  : "text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {n}w
            </button>
          ))}
        </div>
        <span className="text-xs text-neutral-500">Top 5 behaviors</span>
      </div>

      {!hasData ? (
        <PatternEmpty message="Keep recording. The chart fills in as you tag behaviors." />
      ) : (
        <>
          <div className="rounded-xl border border-neutral-100 bg-white p-3">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#244468" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 14, fill: "#8bacc4" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 14, fill: "#8bacc4" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1a3352",
                      border: "1px solid #244468",
                      borderRadius: 8,
                      color: "#f5f0e0",
                    }}
                    cursor={{ fill: "rgba(201,168,76,0.08)" }}
                  />
                  {visibleBehaviors.map((b) => (
                    <Bar
                      key={b}
                      dataKey={b}
                      stackId="a"
                      fill={COLOR[behaviorColor(b)] ?? COLOR.neutral}
                      radius={[2, 2, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.topBehaviors.map((b) => {
              const isHidden = hidden.has(b);
              const color = COLOR[behaviorColor(b)] ?? COLOR.neutral;
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => {
                    const next = new Set(hidden);
                    if (isHidden) next.delete(b);
                    else next.add(b);
                    setHidden(next);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border transition ${
                    isHidden
                      ? "bg-neutral-100 text-neutral-400 border-neutral-200"
                      : "bg-white text-neutral-700 border-neutral-300"
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: isHidden ? "#d6d3d1" : color }}
                  />
                  {b}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
