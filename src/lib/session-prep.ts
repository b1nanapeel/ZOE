import { buildTrends, type TrendItem, type PatternClip } from "./patterns";

export interface SessionPrepClip extends PatternClip {
  id: string;
  parent_interpretation: string | null;
  parent_feeling: string | null;
}

export interface ActiveMission {
  id: string;
  prompt: string;
  status: "ACTIVE" | "COMPLETED" | "EXPIRED";
  due_date: string | null;
  assigned_by_name: string;
}

export interface SessionPrepSummary {
  period: { from: string; to: string };
  totalClips: number;
  topBehaviors: { behavior: string; count: number }[];
  newBehaviors: string[];
  trends: TrendItem[];
  parentReflections: { clipId: string; text: string; date: string }[];
  activeMissions: ActiveMission[];
  missionCompletions: number;
}

export function buildSessionPrep({
  clipsInPeriod,
  clipsBeforePeriod,
  missions,
  missionCompletions,
  from,
  to,
}: {
  clipsInPeriod: SessionPrepClip[];
  clipsBeforePeriod: SessionPrepClip[];
  missions: ActiveMission[];
  missionCompletions: number;
  from: Date;
  to: Date;
}): SessionPrepSummary {
  const behaviorCounts = new Map<string, number>();
  clipsInPeriod.forEach((c) =>
    c.behaviors.forEach((b) =>
      behaviorCounts.set(b, (behaviorCounts.get(b) ?? 0) + 1),
    ),
  );
  const topBehaviors = [...behaviorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([behavior, count]) => ({ behavior, count }));

  const seenBefore = new Set<string>();
  clipsBeforePeriod.forEach((c) =>
    c.behaviors.forEach((b) => seenBefore.add(b)),
  );
  const newBehaviors = [...behaviorCounts.keys()].filter(
    (b) => !seenBefore.has(b),
  );

  const trends = buildTrends(clipsInPeriod, 4);

  const parentReflections = clipsInPeriod
    .filter((c) => c.parent_interpretation || c.parent_feeling)
    .slice(0, 5)
    .map((c) => ({
      clipId: c.id,
      text: [c.parent_interpretation, c.parent_feeling]
        .filter(Boolean)
        .join(" — "),
      date: c.uploaded_at,
    }));

  return {
    period: { from: from.toISOString(), to: to.toISOString() },
    totalClips: clipsInPeriod.length,
    topBehaviors,
    newBehaviors,
    trends,
    parentReflections,
    activeMissions: missions.filter((m) => m.status === "ACTIVE"),
    missionCompletions,
  };
}
