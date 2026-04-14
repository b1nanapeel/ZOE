import Link from "next/link";
import { redirect } from "next/navigation";
import { PatternsView } from "@/components/patterns/PatternsView";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";
import { buildTrends, type PatternClip } from "@/lib/patterns";
import {
  formatInsights,
  searchResearch,
  type ResearchInsight,
} from "@/lib/research-search";

export default async function PatternsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <p className="text-sm text-neutral-600">Supabase isn't configured.</p>
    );
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: child } = await supabase
    .from("children")
    .select("id, name")
    .eq("parent_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!child) {
    return (
      <p className="text-sm text-neutral-600">
        Add a child profile first.{" "}
        <Link href="/onboarding" className="text-primary-600 underline">
          Set one up
        </Link>
        .
      </p>
    );
  }

  // Pull the last 12 weeks for any view
  const since = new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000)
    .toISOString();

  const { data: clips } = await supabase
    .from("clips")
    .select("uploaded_at, behaviors, antecedents, location")
    .eq("child_id", child.id)
    .eq("is_deleted", false)
    .gte("uploaded_at", since)
    .order("uploaded_at", { ascending: false });

  // Find behaviors that will appear as trends (5+ occurrences) and look up insights.
  const trends = buildTrends((clips ?? []) as PatternClip[], 4);
  const insightLookups = await Promise.all(
    trends.map(async (t) => {
      const matches = await searchResearch(t.behavior, 1);
      return [t.behavior, formatInsights(matches)] as const;
    }),
  );
  const insightsByBehavior: Record<string, ResearchInsight[]> = {};
  insightLookups.forEach(([behavior, insights]) => {
    if (insights.length) insightsByBehavior[behavior] = insights;
  });

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold text-neutral-900">Patterns</h1>
        <p className="mt-1 text-sm text-neutral-600">
          What we're seeing across {child.name}'s clips.
        </p>
      </header>
      <PatternsView
        clips={clips ?? []}
        insightsByBehavior={insightsByBehavior}
      />
    </div>
  );
}
