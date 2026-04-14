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
import { Activity } from "lucide-react";

export interface MovementPoint {
  uploaded_at: string;
  movement_features: {
    grossMotorActivityLevel?: number;
    repetitiveMotionScore?: number;
    handProximityToHead?: number;
  } | null;
}

export function MovementTrends({
  clips,
  weeks = 8,
}: {
  clips: MovementPoint[];
  weeks?: number;
}) {
  const today = startOfWeek(new Date(), { weekStartsOn: 1 });
  const buckets = Array.from({ length: weeks }, (_, idx) => {
    const start = addWeeks(today, -(weeks - 1 - idx));
    return {
      key: start.toISOString(),
      label: format(start, "MMM d"),
      activity: 0,
      repetitive: 0,
      hands: 0,
      n: 0,
    };
  });
  const earliest = new Date(buckets[0].key);

  let any = false;
  clips.forEach((c) => {
    const f = c.movement_features;
    if (!f) return;
    const at = new Date(c.uploaded_at);
    if (at < earliest) return;
    const idx = Math.min(
      Math.floor(
        (at.getTime() - earliest.getTime()) / (7 * 24 * 60 * 60 * 1000),
      ),
      weeks - 1,
    );
    if (idx < 0) return;
    buckets[idx].activity += Number(f.grossMotorActivityLevel ?? 0);
    buckets[idx].repetitive += Number(f.repetitiveMotionScore ?? 0);
    buckets[idx].hands += Number(f.handProximityToHead ?? 0);
    buckets[idx].n += 1;
    any = true;
  });

  // Average per bucket and scale activity to 0..100 for readability
  const data = buckets.map((b) => ({
    label: b.label,
    activity: b.n ? Math.round((b.activity / b.n) * 1000) : 0,
    repetitive: b.n ? Math.round((b.repetitive / b.n) * 100) : 0,
    hands: b.n ? Math.round((b.hands / b.n) * 100) : 0,
  }));

  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary-500" />
        <h3 className="text-base font-semibold text-neutral-900">
          Movement trends
        </h3>
      </div>
      {!any ? (
        <p className="text-sm text-neutral-500">
          Once a few clips with detectable poses are recorded, ZOE will chart
          movement trends here.
        </p>
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-neutral-100 p-3">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#244468" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 14, fill: "#8bacc4" }}
                />
                <YAxis tick={{ fontSize: 14, fill: "#8bacc4" }} />
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
                  dataKey="activity"
                  name="Activity (×1000)"
                  stroke="#c9a84c"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="repetitive"
                  name="Repetitive (%)"
                  stroke="#6892b0"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="hands"
                  name="Hands near head (%)"
                  stroke="#b09cd6"
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
