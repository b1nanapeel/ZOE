"use client";

import { useMemo, useState } from "react";
import {
  buildCommunicationLog,
  buildContextMatrix,
  buildFrequency,
  buildTrends,
  type PatternClip,
} from "@/lib/patterns";
import { BehaviorFrequencyChart } from "./BehaviorFrequencyChart";
import { ContextHeatmap } from "./ContextHeatmap";
import { TrendList } from "./TrendList";
import { CommunicationLog } from "./CommunicationLog";
import { cn } from "@/lib/utils";
import type { ResearchInsight } from "@/lib/research-search";

const TABS = [
  { id: "frequency", label: "Frequency" },
  { id: "context", label: "Context" },
  { id: "trends", label: "Trends" },
  { id: "communication", label: "Communication" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export function PatternsView({
  clips,
  insightsByBehavior = {},
}: {
  clips: PatternClip[];
  insightsByBehavior?: Record<string, ResearchInsight[]>;
}) {
  const [tab, setTab] = useState<TabId>("frequency");
  const [weeks, setWeeks] = useState(8);

  const frequency = useMemo(
    () => buildFrequency(clips, weeks),
    [clips, weeks],
  );
  const matrices = useMemo(
    () => ({
      antecedents: buildContextMatrix(clips, "antecedents"),
      location: buildContextMatrix(clips, "location"),
    }),
    [clips],
  );
  const trends = useMemo(() => buildTrends(clips, 4), [clips]);
  const communication = useMemo(
    () => buildCommunicationLog(clips, weeks),
    [clips, weeks],
  );

  return (
    <div className="space-y-5">
      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex gap-1 border-b border-neutral-200">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "shrink-0 -mb-px border-b-2 px-3 py-2 text-sm font-medium transition",
                tab === t.id
                  ? "border-primary-500 text-primary-700"
                  : "border-transparent text-neutral-500 hover:text-neutral-700",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "frequency" && (
        <BehaviorFrequencyChart
          data={frequency}
          weeks={weeks}
          onWeeksChange={setWeeks}
        />
      )}
      {tab === "context" && <ContextHeatmap matrices={matrices} />}
      {tab === "trends" && (
        <TrendList trends={trends} insightsByBehavior={insightsByBehavior} />
      )}
      {tab === "communication" && <CommunicationLog weeks={communication} />}
    </div>
  );
}
