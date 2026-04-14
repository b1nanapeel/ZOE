"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CommunicationWeek } from "@/lib/patterns";
import { PatternEmpty } from "./EmptyState";

export function CommunicationLog({ weeks }: { weeks: CommunicationWeek[] }) {
  const total = weeks.reduce((s, w) => s + w.total, 0);
  if (total === 0) {
    return (
      <PatternEmpty message="Tag communication behaviors on clips to see them here." />
    );
  }

  const last = weeks[weeks.length - 1]?.total ?? 0;
  const prev = weeks[weeks.length - 2]?.total ?? 0;
  const delta = last - prev;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-neutral-100 bg-white p-4">
        <p className="text-xs uppercase tracking-wide text-neutral-500">
          This week
        </p>
        <p className="mt-1 font-mono text-2xl font-semibold text-neutral-900">
          {last}{" "}
          <span className="text-sm font-normal text-neutral-500">
            communication clips
          </span>
        </p>
        <p
          className={`mt-1 text-xs font-medium ${
            delta > 0
              ? "text-secondary-700"
              : delta < 0
                ? "text-red-600"
                : "text-neutral-500"
          }`}
        >
          {delta > 0 ? "+" : ""}
          {delta} vs last week
        </p>
      </div>

      <div className="rounded-xl border border-neutral-100 bg-white p-3">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeks}>
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
                cursor={{ stroke: "#c9a84c", strokeOpacity: 0.3 }}
              />
              <Legend wrapperStyle={{ fontSize: 14, color: "#b5cad9" }} />
              <Line
                type="monotone"
                dataKey="vocalized"
                name="Vocalized"
                stroke="#6892b0"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="gestured"
                name="Gesture / eye contact"
                stroke="#c9a84c"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="aac"
                name="AAC"
                stroke="#b09cd6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
