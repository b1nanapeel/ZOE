import { addWeeks, format, startOfWeek } from "date-fns";
import { BEHAVIOR_TAGS } from "./constants";

const COMMUNICATION_SET = new Set(BEHAVIOR_TAGS.Communication as readonly string[]);

export interface PatternClip {
  uploaded_at: string;
  behaviors: string[];
  antecedents: string[];
  location: string | null;
}

// =========================================================
// Behavior frequency: counts per behavior per week
// =========================================================
export interface FrequencyWeek {
  weekStart: string; // ISO date
  label: string; // "Mar 10"
  counts: Record<string, number>;
}

export interface FrequencyResult {
  weeks: FrequencyWeek[];
  topBehaviors: string[]; // ordered by total desc
}

export function buildFrequency(
  clips: PatternClip[],
  weeks: number,
  filterBehaviors?: string[],
): FrequencyResult {
  const today = startOfWeek(new Date(), { weekStartsOn: 1 });
  const buckets: FrequencyWeek[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const start = addWeeks(today, -i);
    buckets.push({
      weekStart: start.toISOString(),
      label: format(start, "MMM d"),
      counts: {},
    });
  }
  const earliest = new Date(buckets[0].weekStart);

  const totals = new Map<string, number>();
  clips.forEach((c) => {
    const at = new Date(c.uploaded_at);
    if (at < earliest) return;
    const idx = Math.min(
      Math.floor(
        (at.getTime() - earliest.getTime()) / (7 * 24 * 60 * 60 * 1000),
      ),
      weeks - 1,
    );
    if (idx < 0) return;
    c.behaviors.forEach((b) => {
      if (filterBehaviors && !filterBehaviors.includes(b)) return;
      buckets[idx].counts[b] = (buckets[idx].counts[b] ?? 0) + 1;
      totals.set(b, (totals.get(b) ?? 0) + 1);
    });
  });

  const topBehaviors = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);

  return { weeks: buckets, topBehaviors };
}

// =========================================================
// Behavior x Context co-occurrence
// =========================================================
export interface ContextCell {
  behavior: string;
  context: string;
  count: number;
  percentage: number; // out of total occurrences of this behavior
}

export interface ContextMatrix {
  behaviors: string[];
  contexts: string[];
  cells: ContextCell[];
}

export function buildContextMatrix(
  clips: PatternClip[],
  source: "antecedents" | "location",
): ContextMatrix {
  const behaviorTotals = new Map<string, number>();
  const pairCounts = new Map<string, Map<string, number>>();

  clips.forEach((c) => {
    const contexts =
      source === "antecedents"
        ? c.antecedents
        : c.location
          ? [c.location]
          : [];
    if (contexts.length === 0) return;
    c.behaviors.forEach((b) => {
      behaviorTotals.set(b, (behaviorTotals.get(b) ?? 0) + 1);
      let row = pairCounts.get(b);
      if (!row) {
        row = new Map();
        pairCounts.set(b, row);
      }
      contexts.forEach((ctx) =>
        row!.set(ctx, (row!.get(ctx) ?? 0) + 1),
      );
    });
  });

  const behaviors = [...behaviorTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([b]) => b);

  const contextSet = new Set<string>();
  pairCounts.forEach((row) => row.forEach((_, ctx) => contextSet.add(ctx)));
  const contexts = [...contextSet];

  const cells: ContextCell[] = [];
  behaviors.forEach((b) => {
    const total = behaviorTotals.get(b) ?? 0;
    const row = pairCounts.get(b);
    contexts.forEach((ctx) => {
      const count = row?.get(ctx) ?? 0;
      cells.push({
        behavior: b,
        context: ctx,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      });
    });
  });

  return { behaviors, contexts, cells };
}

// =========================================================
// Trends: for behaviors with 5+ occurrences, compare last N
// weeks to previous N weeks
// =========================================================
export type TrendDirection = "increasing" | "decreasing" | "stable";

export interface TrendItem {
  behavior: string;
  direction: TrendDirection;
  percentChange: number;
  totalOccurrences: number;
  spark: number[]; // per-week counts
}

export function buildTrends(
  clips: PatternClip[],
  periodWeeks = 4,
): TrendItem[] {
  const { weeks } = buildFrequency(clips, periodWeeks * 2);
  const totals = new Map<string, number>();
  weeks.forEach((w) =>
    Object.entries(w.counts).forEach(([b, n]) =>
      totals.set(b, (totals.get(b) ?? 0) + n),
    ),
  );

  const items: TrendItem[] = [];
  totals.forEach((total, behavior) => {
    if (total < 5) return;
    const spark = weeks.map((w) => w.counts[behavior] ?? 0);
    const prev = spark
      .slice(0, periodWeeks)
      .reduce((sum, n) => sum + n, 0);
    const recent = spark
      .slice(periodWeeks)
      .reduce((sum, n) => sum + n, 0);
    let direction: TrendDirection = "stable";
    let percentChange = 0;
    if (prev === 0 && recent > 0) {
      direction = "increasing";
      percentChange = 100;
    } else if (prev > 0) {
      percentChange = Math.round(((recent - prev) / prev) * 100);
      if (percentChange >= 20) direction = "increasing";
      else if (percentChange <= -20) direction = "decreasing";
    }
    items.push({
      behavior,
      direction,
      percentChange,
      totalOccurrences: total,
      spark,
    });
  });

  return items.sort(
    (a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange),
  );
}

// =========================================================
// Communication log: weekly counts of communication clips
// =========================================================
export interface CommunicationWeek {
  weekStart: string;
  label: string;
  vocalized: number;
  gestured: number;
  aac: number;
  total: number;
}

export function buildCommunicationLog(
  clips: PatternClip[],
  weeks: number,
): CommunicationWeek[] {
  const today = startOfWeek(new Date(), { weekStartsOn: 1 });
  const buckets: CommunicationWeek[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const start = addWeeks(today, -i);
    buckets.push({
      weekStart: start.toISOString(),
      label: format(start, "MMM d"),
      vocalized: 0,
      gestured: 0,
      aac: 0,
      total: 0,
    });
  }
  const earliest = new Date(buckets[0].weekStart);

  clips.forEach((c) => {
    const at = new Date(c.uploaded_at);
    if (at < earliest) return;
    const idx = Math.min(
      Math.floor(
        (at.getTime() - earliest.getTime()) / (7 * 24 * 60 * 60 * 1000),
      ),
      weeks - 1,
    );
    if (idx < 0) return;
    let counted = false;
    c.behaviors.forEach((b) => {
      if (!COMMUNICATION_SET.has(b)) return;
      counted = true;
      if (b === "Vocalized" || b === "Said a word/phrase" || b === "Echolalia")
        buckets[idx].vocalized++;
      else if (b === "Gestured/pointed" || b === "Made eye contact")
        buckets[idx].gestured++;
      else if (b === "Used AAC device") buckets[idx].aac++;
    });
    if (counted) buckets[idx].total++;
  });

  return buckets;
}
