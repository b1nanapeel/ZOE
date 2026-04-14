// Pure math over a child's tagged clips. No external API calls.
// Generates written paragraphs framed as "ZOE observed" — never diagnostic.

import { BEHAVIOR_TAGS } from "./constants";
import { buildTrends, type TrendItem } from "./patterns";

export interface IntelligenceClip {
  uploaded_at: string;
  behaviors: string[];
  antecedents: string[];
  location: string | null;
  time_context: string | null;
  people_present: string[];
  mood_before: string | null;
  audio_features?: {
    vocalizationSeconds?: number;
    avgPitchHz?: number;
    pitchStdHz?: number;
    speechRatePerSec?: number;
    pauseRatio?: number;
  } | null;
  movement_features?: {
    grossMotorActivityLevel?: number;
    repetitiveMotionScore?: number;
    handProximityToHead?: number;
    centerOfMassSway?: number;
  } | null;
}

const POSITIVE_BEHAVIORS = new Set([
  "Smiled/laughed",
  "Appeared calm",
  "Made eye contact",
  "Vocalized",
  "Said a word/phrase",
  "Gestured/pointed",
  "Used AAC device",
  "Reached for something",
]);

const CHALLENGING_BEHAVIORS = new Set([
  "Cried/screamed",
  "Appeared distressed",
  "Meltdown",
  "Shutdown",
  "Moved away/withdrew",
  "Covered ears",
  "Avoided touch",
]);

export interface TriggerInsight {
  behavior: string;
  totalOccurrences: number;
  topTrigger: string;
  topTriggerCount: number;
  topTriggerPercentage: number;
  paragraph: string;
}

export interface TimePatternInsight {
  behavior: string;
  totalOccurrences: number;
  topTimeContext: string | null;
  topTimeContextPercentage: number;
  topTimeOfDay: string | null;
  topTimeOfDayPercentage: number;
  paragraph: string;
}

export interface TrendInsight {
  behavior: string;
  direction: TrendItem["direction"];
  percentChange: number;
  totalOccurrences: number;
  paragraph: string;
}

export interface ContextCorrelationInsight {
  combo: string;
  location: string | null;
  mood: string | null;
  people: string | null;
  positiveCount: number;
  challengingCount: number;
  total: number;
  paragraph: string;
}

export interface ProgressSummary {
  recentTotal: number;
  prevTotal: number;
  changePercent: number;
  recentTopBehaviors: { behavior: string; count: number }[];
  newBehaviors: string[];
  paragraph: string;
}

export interface AudioInsight {
  paragraph: string;
  recentAvgVocalizationSec: number;
  prevAvgVocalizationSec: number;
  changePercent: number;
}

export interface MovementInsight {
  paragraph: string;
  byContext?: { location: string; recent: number; prev: number }[];
}

export interface TherapistSummary {
  paragraphs: string[];
  generatedAt: string;
}

export interface HighlightInsight {
  id: string;
  category: "trigger" | "time" | "trend" | "context" | "progress";
  title: string;
  paragraph: string;
}

export interface IntelligenceReport {
  triggers: TriggerInsight[];
  timePatterns: TimePatternInsight[];
  trends: TrendInsight[];
  contextCorrelations: ContextCorrelationInsight[];
  progress: ProgressSummary | null;
  audio: AudioInsight | null;
  movement: MovementInsight | null;
  therapistSummary: TherapistSummary;
  topInsights: HighlightInsight[];
  totalClips: number;
  hasEnoughData: boolean;
}

export const INTELLIGENCE_DISCLAIMER =
  "These observations are based on your tagged clips and are not clinical assessments.";

// =========================================================
// 1) TRIGGER ANALYSIS
// =========================================================
export function buildTriggerInsights(
  clips: IntelligenceClip[],
): TriggerInsight[] {
  const behaviorTotals = new Map<string, number>();
  const pairCounts = new Map<string, Map<string, number>>();

  clips.forEach((c) => {
    if (c.antecedents.length === 0) return;
    c.behaviors.forEach((b) => {
      behaviorTotals.set(b, (behaviorTotals.get(b) ?? 0) + 1);
      let row = pairCounts.get(b);
      if (!row) {
        row = new Map();
        pairCounts.set(b, row);
      }
      c.antecedents.forEach((a) =>
        row!.set(a, (row!.get(a) ?? 0) + 1),
      );
    });
  });

  const out: TriggerInsight[] = [];
  behaviorTotals.forEach((total, behavior) => {
    if (total < 3) return;
    const row = pairCounts.get(behavior);
    if (!row || row.size === 0) return;
    const [topTrigger, topCount] = [...row.entries()].sort(
      (a, b) => b[1] - a[1],
    )[0];
    const pct = Math.round((topCount / total) * 100);
    if (pct < 40) return; // not strong enough to report
    out.push({
      behavior,
      totalOccurrences: total,
      topTrigger,
      topTriggerCount: topCount,
      topTriggerPercentage: pct,
      paragraph: `ZOE observed "${behavior}" in ${total} clips. ${pct}% of those (${topCount} clips) followed "${topTrigger}".`,
    });
  });
  return out.sort((a, b) => b.topTriggerPercentage - a.topTriggerPercentage);
}

// =========================================================
// 2) TIME PATTERN ANALYSIS
// =========================================================
function timeBucket(d: Date): string {
  const h = d.getHours();
  if (h < 6) return "early morning";
  if (h < 11) return "morning";
  if (h < 14) return "midday";
  if (h < 17) return "afternoon";
  if (h < 20) return "evening";
  return "night";
}

export function buildTimePatternInsights(
  clips: IntelligenceClip[],
): TimePatternInsight[] {
  const behaviorTotals = new Map<string, number>();
  const timeContextCounts = new Map<string, Map<string, number>>();
  const timeOfDayCounts = new Map<string, Map<string, number>>();

  clips.forEach((c) => {
    const bucket = timeBucket(new Date(c.uploaded_at));
    c.behaviors.forEach((b) => {
      behaviorTotals.set(b, (behaviorTotals.get(b) ?? 0) + 1);

      if (c.time_context) {
        let row = timeContextCounts.get(b);
        if (!row) {
          row = new Map();
          timeContextCounts.set(b, row);
        }
        row.set(c.time_context, (row.get(c.time_context) ?? 0) + 1);
      }

      let tod = timeOfDayCounts.get(b);
      if (!tod) {
        tod = new Map();
        timeOfDayCounts.set(b, tod);
      }
      tod.set(bucket, (tod.get(bucket) ?? 0) + 1);
    });
  });

  const out: TimePatternInsight[] = [];
  behaviorTotals.forEach((total, behavior) => {
    if (total < 3) return;

    const tcRow = timeContextCounts.get(behavior);
    let topTimeContext: string | null = null;
    let topTimeContextPct = 0;
    if (tcRow && tcRow.size > 0) {
      const [tc, count] = [...tcRow.entries()].sort((a, b) => b[1] - a[1])[0];
      const pct = Math.round((count / total) * 100);
      if (pct >= 40) {
        topTimeContext = tc;
        topTimeContextPct = pct;
      }
    }

    const todRow = timeOfDayCounts.get(behavior);
    let topTimeOfDay: string | null = null;
    let topTimeOfDayPct = 0;
    if (todRow && todRow.size > 0) {
      const [tod, count] = [...todRow.entries()].sort(
        (a, b) => b[1] - a[1],
      )[0];
      const pct = Math.round((count / total) * 100);
      if (pct >= 40) {
        topTimeOfDay = tod;
        topTimeOfDayPct = pct;
      }
    }

    if (!topTimeContext && !topTimeOfDay) return;

    const parts: string[] = [];
    if (topTimeContext)
      parts.push(
        `${topTimeContextPct}% during "${topTimeContext.toLowerCase()}"`,
      );
    if (topTimeOfDay)
      parts.push(`${topTimeOfDayPct}% in the ${topTimeOfDay}`);

    out.push({
      behavior,
      totalOccurrences: total,
      topTimeContext,
      topTimeContextPercentage: topTimeContextPct,
      topTimeOfDay,
      topTimeOfDayPercentage: topTimeOfDayPct,
      paragraph: `Based on your recordings, "${behavior}" tends to cluster ${parts.join(" and ")}.`,
    });
  });

  return out.sort(
    (a, b) =>
      Math.max(b.topTimeContextPercentage, b.topTimeOfDayPercentage) -
      Math.max(a.topTimeContextPercentage, a.topTimeOfDayPercentage),
  );
}

// =========================================================
// 3) TREND NARRATIVE
// =========================================================
export function buildTrendInsights(
  clips: IntelligenceClip[],
  periodWeeks = 4,
): TrendInsight[] {
  const trends = buildTrends(clips, periodWeeks);
  return trends.map((t) => {
    let paragraph: string;
    if (t.direction === "increasing") {
      paragraph = `Over the past ${periodWeeks} weeks "${t.behavior}" increased ${t.percentChange}% compared to the prior ${periodWeeks} weeks (${t.totalOccurrences} total clips).`;
    } else if (t.direction === "decreasing") {
      paragraph = `Over the past ${periodWeeks} weeks "${t.behavior}" decreased ${Math.abs(t.percentChange)}% compared to the prior ${periodWeeks} weeks.`;
    } else {
      paragraph = `"${t.behavior}" stayed roughly stable across the past ${periodWeeks * 2} weeks.`;
    }
    return {
      behavior: t.behavior,
      direction: t.direction,
      percentChange: t.percentChange,
      totalOccurrences: t.totalOccurrences,
      paragraph,
    };
  });
}

// =========================================================
// 4) CONTEXT CORRELATION
// =========================================================
function classifyClip(behaviors: string[]): "positive" | "challenging" | "neutral" {
  let pos = 0;
  let neg = 0;
  behaviors.forEach((b) => {
    if (POSITIVE_BEHAVIORS.has(b)) pos++;
    if (CHALLENGING_BEHAVIORS.has(b)) neg++;
  });
  if (pos === 0 && neg === 0) return "neutral";
  if (pos > neg) return "positive";
  if (neg > pos) return "challenging";
  return "neutral";
}

export function buildContextCorrelationInsights(
  clips: IntelligenceClip[],
): ContextCorrelationInsight[] {
  interface Bucket {
    location: string | null;
    mood: string | null;
    people: string | null;
    positive: number;
    challenging: number;
    total: number;
  }
  const buckets = new Map<string, Bucket>();

  clips.forEach((c) => {
    const klass = classifyClip(c.behaviors);
    if (klass === "neutral") return;
    const key = [
      c.location ?? "?",
      c.mood_before ?? "?",
      c.people_present[0] ?? "?",
    ].join("|");
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = {
        location: c.location,
        mood: c.mood_before,
        people: c.people_present[0] ?? null,
        positive: 0,
        challenging: 0,
        total: 0,
      };
      buckets.set(key, bucket);
    }
    bucket.total += 1;
    if (klass === "positive") bucket.positive += 1;
    else bucket.challenging += 1;
  });

  const out: ContextCorrelationInsight[] = [];
  buckets.forEach((b) => {
    if (b.total < 3) return;
    const labelParts = [b.location, b.mood, b.people].filter(Boolean);
    if (labelParts.length === 0) return;
    const combo = labelParts.join(" + ");
    const skew = b.positive - b.challenging;
    let paragraph: string;
    if (skew > 0) {
      paragraph = `When ${combo.toLowerCase()}, ZOE observed positive moments more often (${b.positive} positive vs ${b.challenging} challenging across ${b.total} clips).`;
    } else if (skew < 0) {
      paragraph = `When ${combo.toLowerCase()}, ZOE observed challenging moments more often (${b.challenging} challenging vs ${b.positive} positive across ${b.total} clips).`;
    } else {
      paragraph = `When ${combo.toLowerCase()}, positive and challenging moments occurred about equally (${b.total} clips).`;
    }
    out.push({
      combo,
      location: b.location,
      mood: b.mood,
      people: b.people,
      positiveCount: b.positive,
      challengingCount: b.challenging,
      total: b.total,
      paragraph,
    });
  });

  return out.sort(
    (a, b) =>
      Math.abs(b.positiveCount - b.challengingCount) -
      Math.abs(a.positiveCount - a.challengingCount),
  );
}

// =========================================================
// 5) PROGRESS SUMMARY (last 2 weeks vs prior 2 weeks)
// =========================================================
export function buildProgressSummary(
  clips: IntelligenceClip[],
): ProgressSummary | null {
  const now = Date.now();
  const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000;
  const recentStart = now - TWO_WEEKS;
  const prevStart = now - 2 * TWO_WEEKS;

  const recent = clips.filter((c) => {
    const t = new Date(c.uploaded_at).getTime();
    return t >= recentStart && t <= now;
  });
  const prev = clips.filter((c) => {
    const t = new Date(c.uploaded_at).getTime();
    return t >= prevStart && t < recentStart;
  });

  if (recent.length === 0 && prev.length === 0) return null;

  const recentBehaviorCounts = new Map<string, number>();
  recent.forEach((c) =>
    c.behaviors.forEach((b) =>
      recentBehaviorCounts.set(b, (recentBehaviorCounts.get(b) ?? 0) + 1),
    ),
  );
  const recentTopBehaviors = [...recentBehaviorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([behavior, count]) => ({ behavior, count }));

  const prevBehaviorSet = new Set<string>();
  prev.forEach((c) => c.behaviors.forEach((b) => prevBehaviorSet.add(b)));
  const newBehaviors = [...recentBehaviorCounts.keys()].filter(
    (b) => !prevBehaviorSet.has(b),
  );

  const changePercent =
    prev.length === 0
      ? recent.length > 0
        ? 100
        : 0
      : Math.round(((recent.length - prev.length) / prev.length) * 100);

  const direction =
    changePercent > 10
      ? "more"
      : changePercent < -10
        ? "fewer"
        : "about the same number of";
  let paragraph = `In the last 2 weeks you recorded ${recent.length} clips, ${direction} than the prior 2 weeks (${prev.length}).`;
  if (recentTopBehaviors.length > 0) {
    paragraph += ` Most frequent: ${recentTopBehaviors.map((b) => `${b.behavior} (${b.count})`).join(", ")}.`;
  }
  if (newBehaviors.length > 0) {
    paragraph += ` New this period: ${newBehaviors.slice(0, 4).join(", ")}.`;
  }

  return {
    recentTotal: recent.length,
    prevTotal: prev.length,
    changePercent,
    recentTopBehaviors,
    newBehaviors,
    paragraph,
  };
}

// =========================================================
// 6) AUDIO INSIGHTS — recent 2 weeks vs prior 2 weeks
// =========================================================
function avg(xs: number[]): number {
  return xs.length ? xs.reduce((s, n) => s + n, 0) / xs.length : 0;
}

function splitRecentPrev(
  clips: IntelligenceClip[],
): { recent: IntelligenceClip[]; prev: IntelligenceClip[] } {
  const now = Date.now();
  const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000;
  const recent: IntelligenceClip[] = [];
  const prev: IntelligenceClip[] = [];
  clips.forEach((c) => {
    const t = new Date(c.uploaded_at).getTime();
    if (t >= now - TWO_WEEKS) recent.push(c);
    else if (t >= now - 2 * TWO_WEEKS) prev.push(c);
  });
  return { recent, prev };
}

export function buildAudioInsight(
  clips: IntelligenceClip[],
): AudioInsight | null {
  const withAudio = clips.filter(
    (c) =>
      c.audio_features &&
      typeof c.audio_features.vocalizationSeconds === "number",
  );
  if (withAudio.length < 3) return null;

  const { recent, prev } = splitRecentPrev(withAudio);
  if (recent.length === 0) return null;

  const recentSec = recent
    .map((c) => c.audio_features?.vocalizationSeconds ?? 0)
    .filter((n) => n > 0);
  const prevSec = prev
    .map((c) => c.audio_features?.vocalizationSeconds ?? 0)
    .filter((n) => n > 0);

  const recentAvg = avg(recentSec);
  const prevAvg = avg(prevSec);

  let changePercent = 0;
  if (prevAvg === 0 && recentAvg > 0) changePercent = 100;
  else if (prevAvg > 0)
    changePercent = Math.round(((recentAvg - prevAvg) / prevAvg) * 100);

  let paragraph: string;
  if (prevSec.length === 0) {
    paragraph = `ZOE observed an average of ${recentAvg.toFixed(1)} seconds of vocalization per clip across the last 2 weeks (${recent.length} clips with audio).`;
  } else if (Math.abs(changePercent) < 10) {
    paragraph = `Average vocalization duration has stayed steady at ~${recentAvg.toFixed(1)} seconds per clip over the past 2 weeks.`;
  } else {
    const direction = changePercent > 0 ? "increased" : "decreased";
    paragraph = `Average vocalization duration has ${direction} ${Math.abs(changePercent)}% over the past 2 weeks (${recentAvg.toFixed(1)}s per clip vs ${prevAvg.toFixed(1)}s prior).`;
  }

  return {
    paragraph,
    recentAvgVocalizationSec: Number(recentAvg.toFixed(2)),
    prevAvgVocalizationSec: Number(prevAvg.toFixed(2)),
    changePercent,
  };
}

// =========================================================
// 7) MOVEMENT INSIGHTS — recent 2 weeks vs prior 2 weeks
//    Plus per-location breakdown of repetitive motion.
// =========================================================
export function buildMovementInsight(
  clips: IntelligenceClip[],
): MovementInsight | null {
  const withMovement = clips.filter(
    (c) =>
      c.movement_features &&
      typeof c.movement_features.repetitiveMotionScore === "number",
  );
  if (withMovement.length < 3) return null;

  const { recent, prev } = splitRecentPrev(withMovement);
  if (recent.length === 0) return null;

  const recentRep = avg(
    recent.map((c) => c.movement_features?.repetitiveMotionScore ?? 0),
  );
  const prevRep = avg(
    prev.map((c) => c.movement_features?.repetitiveMotionScore ?? 0),
  );
  const recentAct = avg(
    recent.map((c) => c.movement_features?.grossMotorActivityLevel ?? 0),
  );
  const prevAct = avg(
    prev.map((c) => c.movement_features?.grossMotorActivityLevel ?? 0),
  );

  function pctChange(now: number, before: number): number {
    if (before === 0) return now > 0 ? 100 : 0;
    return Math.round(((now - before) / before) * 100);
  }

  const repChange = pctChange(recentRep, prevRep);
  const actChange = pctChange(recentAct, prevAct);

  // Per-location repetitive motion breakdown
  const byLoc = new Map<string, { recent: number[]; prev: number[] }>();
  withMovement.forEach((c) => {
    const loc = c.location;
    if (!loc) return;
    const t = new Date(c.uploaded_at).getTime();
    const now = Date.now();
    const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000;
    let bucket = byLoc.get(loc);
    if (!bucket) {
      bucket = { recent: [], prev: [] };
      byLoc.set(loc, bucket);
    }
    const score = c.movement_features?.repetitiveMotionScore ?? 0;
    if (t >= now - TWO_WEEKS) bucket.recent.push(score);
    else if (t >= now - 2 * TWO_WEEKS) bucket.prev.push(score);
  });

  const byContext: { location: string; recent: number; prev: number }[] = [];
  byLoc.forEach((v, location) => {
    if (v.recent.length === 0 && v.prev.length === 0) return;
    byContext.push({
      location,
      recent: Number(avg(v.recent).toFixed(3)),
      prev: Number(avg(v.prev).toFixed(3)),
    });
  });

  const lines: string[] = [];
  if (prev.length === 0) {
    lines.push(
      `ZOE detected an average repetitive-motion score of ${recentRep.toFixed(2)} across ${recent.length} clips in the last 2 weeks.`,
    );
  } else if (Math.abs(repChange) >= 15) {
    const dir = repChange > 0 ? "increased" : "decreased";
    lines.push(
      `Repetitive movement frequency ${dir} ${Math.abs(repChange)}% over the past 2 weeks.`,
    );
  } else {
    lines.push(`Repetitive movement frequency stayed roughly stable.`);
  }

  if (Math.abs(actChange) >= 15 && prev.length > 0) {
    const dir = actChange > 0 ? "more" : "less";
    lines.push(`Overall body activity is ${dir} than 2 weeks ago.`);
  }

  // Pull out the most-changed location for color
  const sortedCtx = byContext
    .filter((c) => c.prev > 0 && c.recent > 0)
    .sort(
      (a, b) =>
        Math.abs((b.recent - b.prev) / b.prev) -
        Math.abs((a.recent - a.prev) / a.prev),
    );
  if (sortedCtx.length > 0) {
    const top = sortedCtx[0];
    const changeLoc = Math.round(((top.recent - top.prev) / top.prev) * 100);
    if (Math.abs(changeLoc) >= 20) {
      const dir = changeLoc > 0 ? "increased" : "decreased";
      lines.push(
        `Repetitive movement ${dir} ${Math.abs(changeLoc)}% in ${top.location.toLowerCase()} settings specifically.`,
      );
    }
  }

  return { paragraph: lines.join(" "), byContext };
}

// =========================================================
// 8) THERAPIST-READY SUMMARY
// =========================================================
function buildTherapistSummary(parts: {
  triggers: TriggerInsight[];
  timePatterns: TimePatternInsight[];
  trends: TrendInsight[];
  contextCorrelations: ContextCorrelationInsight[];
  progress: ProgressSummary | null;
  audio: AudioInsight | null;
  movement: MovementInsight | null;
  totalClips: number;
}): TherapistSummary {
  const lines: string[] = [];
  lines.push(
    `Across ${parts.totalClips} tagged clips, ZOE compiled the following observations.`,
  );
  if (parts.progress) lines.push(parts.progress.paragraph);
  parts.trends.slice(0, 3).forEach((t) => lines.push(t.paragraph));
  parts.triggers.slice(0, 3).forEach((t) => lines.push(t.paragraph));
  parts.timePatterns.slice(0, 2).forEach((t) => lines.push(t.paragraph));
  parts.contextCorrelations.slice(0, 2).forEach((c) => lines.push(c.paragraph));
  if (parts.audio) lines.push(parts.audio.paragraph);
  if (parts.movement) lines.push(parts.movement.paragraph);
  return {
    paragraphs: lines,
    generatedAt: new Date().toISOString(),
  };
}

// =========================================================
// MAIN: full report
// =========================================================
export function buildIntelligenceReport(
  clips: IntelligenceClip[],
): IntelligenceReport {
  const triggers = buildTriggerInsights(clips);
  const timePatterns = buildTimePatternInsights(clips);
  const trends = buildTrendInsights(clips, 4);
  const contextCorrelations = buildContextCorrelationInsights(clips);
  const progress = buildProgressSummary(clips);
  const audio = buildAudioInsight(clips);
  const movement = buildMovementInsight(clips);
  const therapistSummary = buildTherapistSummary({
    triggers,
    timePatterns,
    trends,
    contextCorrelations,
    progress,
    audio,
    movement,
    totalClips: clips.length,
  });

  // Top 3 highlights for dashboard — pick the most "interesting" insights.
  const candidates: HighlightInsight[] = [];
  if (progress && Math.abs(progress.changePercent) >= 15) {
    candidates.push({
      id: "progress",
      category: "progress",
      title: progress.changePercent >= 0 ? "Recent activity" : "Quieter period",
      paragraph: progress.paragraph,
    });
  }
  trends.slice(0, 2).forEach((t) => {
    if (Math.abs(t.percentChange) < 20) return;
    candidates.push({
      id: `trend-${t.behavior}`,
      category: "trend",
      title:
        t.direction === "increasing"
          ? `${t.behavior} is rising`
          : `${t.behavior} is easing`,
      paragraph: t.paragraph,
    });
  });
  triggers.slice(0, 2).forEach((t) => {
    candidates.push({
      id: `trigger-${t.behavior}`,
      category: "trigger",
      title: `What triggers "${t.behavior}"`,
      paragraph: t.paragraph,
    });
  });
  timePatterns.slice(0, 1).forEach((t) => {
    candidates.push({
      id: `time-${t.behavior}`,
      category: "time",
      title: `When "${t.behavior}" happens`,
      paragraph: t.paragraph,
    });
  });
  contextCorrelations.slice(0, 1).forEach((c) => {
    candidates.push({
      id: `context-${c.combo}`,
      category: "context",
      title: `Context: ${c.combo}`,
      paragraph: c.paragraph,
    });
  });
  if (audio && Math.abs(audio.changePercent) >= 15) {
    candidates.push({
      id: "audio",
      category: "trend",
      title:
        audio.changePercent > 0
          ? "Vocalization is rising"
          : "Quieter recordings",
      paragraph: audio.paragraph,
    });
  }
  if (movement) {
    candidates.push({
      id: "movement",
      category: "trend",
      title: "Movement profile",
      paragraph: movement.paragraph,
    });
  }

  const topInsights = candidates.slice(0, 3);

  return {
    triggers,
    timePatterns,
    trends,
    contextCorrelations,
    progress,
    audio,
    movement,
    therapistSummary,
    topInsights,
    totalClips: clips.length,
    hasEnoughData: clips.length >= 5,
  };
}

// Convenience for ad-hoc use of behavior list elsewhere.
export const ALL_BEHAVIORS = Object.values(BEHAVIOR_TAGS).flatMap((arr) => [
  ...arr,
]);
