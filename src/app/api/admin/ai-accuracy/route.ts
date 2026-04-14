import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/admin";
import { BEHAVIOR_TAGS } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Row = {
  ai_suggested_behaviors: string[] | null;
  parent_final_behaviors: string[] | null;
  ai_suggested_antecedents: string[] | null;
  parent_final_antecedents: string[] | null;
  ai_suggested_consequences: string[] | null;
  parent_final_consequences: string[] | null;
  ai_suggested_mood: string | null;
  parent_final_mood: string | null;
  accuracy_score: number | null;
  created_at: string;
};

const BEHAVIOR_CATEGORY_INDEX: Record<string, keyof typeof BEHAVIOR_TAGS> = {};
(Object.keys(BEHAVIOR_TAGS) as Array<keyof typeof BEHAVIOR_TAGS>).forEach(
  (cat) => {
    BEHAVIOR_TAGS[cat].forEach((tag) => {
      BEHAVIOR_CATEGORY_INDEX[tag] = cat;
    });
  },
);

function categorize(tag: string): string | null {
  return BEHAVIOR_CATEGORY_INDEX[tag] ?? null;
}

function weekKey(iso: string): string {
  const d = new Date(iso);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day;
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
  return monday.toISOString().slice(0, 10);
}

export async function GET() {
  if (!isSupabaseConfigured())
    return NextResponse.json({ error: "Not configured." }, { status: 500 });

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  if (!isAdmin(user))
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const { data, error } = await supabase
    .from("ai_feedback_loop")
    .select(
      "ai_suggested_behaviors, parent_final_behaviors, ai_suggested_antecedents, parent_final_antecedents, ai_suggested_consequences, parent_final_consequences, ai_suggested_mood, parent_final_mood, accuracy_score, created_at",
    )
    .order("created_at", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []) as Row[];
  const totalClips = rows.length;

  const scores = rows
    .map((r) => r.accuracy_score)
    .filter((n): n is number => typeof n === "number");
  const overallAccuracy =
    scores.length > 0 ? scores.reduce((s, n) => s + n, 0) / scores.length : 0;

  // Accuracy by behavior category (Jaccard within each category on behaviors).
  const categoryAgg: Record<string, { inter: number; union: number }> = {
    Communication: { inter: 0, union: 0 },
    Movement: { inter: 0, union: 0 },
    Emotional: { inter: 0, union: 0 },
    Sensory: { inter: 0, union: 0 },
  };
  rows.forEach((r) => {
    const ai = r.ai_suggested_behaviors ?? [];
    const parent = r.parent_final_behaviors ?? [];
    (Object.keys(categoryAgg) as string[]).forEach((cat) => {
      const aiCat = new Set(ai.filter((t) => categorize(t) === cat));
      const parentCat = new Set(parent.filter((t) => categorize(t) === cat));
      if (aiCat.size === 0 && parentCat.size === 0) return;
      let inter = 0;
      aiCat.forEach((t) => {
        if (parentCat.has(t)) inter += 1;
      });
      const union = aiCat.size + parentCat.size - inter;
      categoryAgg[cat].inter += inter;
      categoryAgg[cat].union += union;
    });
  });
  const accuracyByCategory = Object.fromEntries(
    Object.entries(categoryAgg).map(([cat, { inter, union }]) => [
      cat,
      union === 0 ? null : inter / union,
    ]),
  );

  // Weekly trend (averages).
  const weekly = new Map<string, { sum: number; count: number }>();
  rows.forEach((r) => {
    if (typeof r.accuracy_score !== "number") return;
    const k = weekKey(r.created_at);
    const w = weekly.get(k) ?? { sum: 0, count: 0 };
    w.sum += r.accuracy_score;
    w.count += 1;
    weekly.set(k, w);
  });
  const trend = [...weekly.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([week, { sum, count }]) => ({
      week,
      accuracy: Math.round((sum / count) * 1000) / 1000,
      clips: count,
    }));

  // Most rejected suggestions: AI said, parent removed.
  const rejectedCounts: Record<string, number> = {};
  const missedCounts: Record<string, number> = {};
  rows.forEach((r) => {
    const aiAll = [
      ...(r.ai_suggested_behaviors ?? []),
      ...(r.ai_suggested_antecedents ?? []),
      ...(r.ai_suggested_consequences ?? []),
    ];
    const parentAll = new Set([
      ...(r.parent_final_behaviors ?? []),
      ...(r.parent_final_antecedents ?? []),
      ...(r.parent_final_consequences ?? []),
    ]);
    const aiSet = new Set(aiAll);
    aiAll.forEach((tag) => {
      if (!parentAll.has(tag))
        rejectedCounts[tag] = (rejectedCounts[tag] ?? 0) + 1;
    });
    parentAll.forEach((tag) => {
      if (!aiSet.has(tag))
        missedCounts[tag] = (missedCounts[tag] ?? 0) + 1;
    });
  });

  const topRejected = Object.entries(rejectedCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));
  const topMissed = Object.entries(missedCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));

  return NextResponse.json({
    totalClips,
    overallAccuracy: Math.round(overallAccuracy * 1000) / 1000,
    accuracyByCategory,
    trend,
    topRejected,
    topMissed,
  });
}
