"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Data = {
  totalClips: number;
  overallAccuracy: number;
  accuracyByCategory: Record<string, number | null>;
  trend: { week: string; accuracy: number; clips: number }[];
  topRejected: { tag: string; count: number }[];
  topMissed: { tag: string; count: number }[];
};

export function AiAccuracySection() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/ai-accuracy", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return (await r.json()) as Data;
      })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, []);

  if (error) {
    return (
      <p className="text-sm text-red-600">
        Could not load accuracy data: {error}
      </p>
    );
  }
  if (!data) {
    return <p className="text-sm text-neutral-500">Loading accuracy…</p>;
  }

  const pct = (n: number | null) =>
    n === null ? "—" : `${Math.round(n * 100)}%`;

  return (
    <div className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Overall AI accuracy
          </p>
          <p className="mt-1 text-3xl font-semibold text-neutral-900">
            {pct(data.overallAccuracy)}
          </p>
        </div>
        <p className="text-sm text-neutral-500">
          Across {data.totalClips} clip{data.totalClips === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(data.accuracyByCategory).map(([cat, acc]) => (
          <div
            key={cat}
            className="rounded-xl border border-neutral-200 p-3"
          >
            <p className="text-xs text-neutral-500">{cat}</p>
            <p className="mt-1 text-xl font-semibold text-neutral-900">
              {pct(acc)}
            </p>
          </div>
        ))}
      </div>

      {data.trend.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Weekly accuracy trend
          </p>
          <div className="h-48 w-full">
            <ResponsiveContainer>
              <LineChart
                data={data.trend.map((t) => ({
                  week: t.week.slice(5),
                  accuracy: Math.round(t.accuracy * 100),
                }))}
                margin={{ top: 6, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  unit="%"
                />
                <Tooltip formatter={(v) => `${v}%`} />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#c9a84c"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <TagList
          title="Most rejected AI suggestions"
          empty="No rejections yet."
          rows={data.topRejected}
        />
        <TagList
          title="Most missed behaviors"
          empty="No missed behaviors yet."
          rows={data.topMissed}
        />
      </div>
    </div>
  );
}

function TagList({
  title,
  empty,
  rows,
}: {
  title: string;
  empty: string;
  rows: { tag: string; count: number }[];
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {title}
      </p>
      {rows.length === 0 ? (
        <p className="text-sm text-neutral-500">{empty}</p>
      ) : (
        <ul className="space-y-1.5">
          {rows.map((r) => (
            <li
              key={r.tag}
              className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            >
              <span className="truncate text-neutral-800">{r.tag}</span>
              <span className="ml-3 shrink-0 font-mono text-xs text-neutral-500">
                {r.count}×
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
