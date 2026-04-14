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
import { format, startOfWeek, addWeeks } from "date-fns";
import { Waves } from "lucide-react";

export interface VocalizationPoint {
  uploaded_at: string;
  audio_features: { vocalizationSeconds?: number } | null;
}

export function VocalizationTrends({
  clips,
  weeks = 8,
}: {
  clips: VocalizationPoint[];
  weeks?: number;
}) {
  const today = startOfWeek(new Date(), { weekStartsOn: 1 });
  const buckets = Array.from({ length: weeks }, (_, idx) => {
    const start = addWeeks(today, -(weeks - 1 - idx));
    return {
      key: start.toISOString(),
      label: format(start, "MMM d"),
      vocalizedSeconds: 0,
      clipsWithVocalization: 0,
    };
  });
  const earliest = new Date(buckets[0].key);

  let any = false;
  clips.forEach((c) => {
    const seconds = Number(c.audio_features?.vocalizationSeconds ?? 0);
    if (!seconds) return;
    const at = new Date(c.uploaded_at);
    if (at < earliest) return;
    const idx = Math.min(
      Math.floor(
        (at.getTime() - earliest.getTime()) / (7 * 24 * 60 * 60 * 1000),
      ),
      weeks - 1,
    );
    if (idx < 0) return;
    buckets[idx].vocalizedSeconds += seconds;
    buckets[idx].clipsWithVocalization += 1;
    any = true;
  });

  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <Waves className="h-4 w-4 text-primary-500" />
        <h3 className="text-base font-semibold text-neutral-900">
          Vocalization trends
        </h3>
      </div>

      {!any ? (
        <p className="text-sm text-neutral-500">
          Once a few clips with audio are recorded, ZOE will chart vocalization
          duration and frequency here.
        </p>
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-neutral-100 p-3">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={buckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="#244468" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 14, fill: "#8bacc4" }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 14, fill: "#8bacc4" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
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
                  yAxisId="left"
                  type="monotone"
                  dataKey="vocalizedSeconds"
                  name="Vocalized (sec)"
                  stroke="#c9a84c"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="clipsWithVocalization"
                  name="Clips with audio"
                  stroke="#6892b0"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  );
}
