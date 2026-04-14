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
              ? "text-emerald-600"
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
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#78716c" }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "#78716c" }}
              />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="vocalized"
                name="Vocalized"
                stroke="#3b82f6"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="gestured"
                name="Gesture / eye contact"
                stroke="#22c55e"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="aac"
                name="AAC"
                stroke="#a855f7"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
