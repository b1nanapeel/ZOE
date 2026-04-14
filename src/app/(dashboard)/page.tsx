import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Sparkles, MapPin, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { UploadButton } from "@/components/clips/UploadButton";
import {
  SessionPrepBanner,
  computeUpcomingTherapy,
} from "@/components/dashboard/SessionPrepBanner";
import {
  MissionCard,
  type MissionData,
} from "@/components/missions/MissionCard";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";

interface RecentClip {
  id: string;
  uploaded_at: string;
  behaviors: string[];
  antecedent_note: string | null;
  location: string | null;
}

interface Ctx {
  name: string;
  child: { id: string; name: string } | null;
  clipsThisWeek: number;
  topBehavior: string | null;
  recentClips: RecentClip[];
  activeMissions: MissionData[];
  upcoming: ReturnType<typeof computeUpcomingTherapy>;
}

async function getContext(): Promise<Ctx> {
  const fallback: Ctx = {
    name: "there",
    child: null,
    clipsThisWeek: 0,
    topBehavior: null,
    recentClips: [],
    activeMissions: [],
    upcoming: null,
  };
  if (!isSupabaseConfigured()) return fallback;

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fallback;

  const greetingName =
    (user.user_metadata as { name?: string } | undefined)?.name ??
    user.email?.split("@")[0] ??
    "there";

  const { data: child } = await supabase
    .from("children")
    .select("id, name")
    .eq("parent_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!child) return { ...fallback, name: greetingName };

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: recent },
    { count: weeklyCount },
    { data: tagRows },
    { data: missions },
    { data: schedules },
  ] = await Promise.all([
    supabase
      .from("clips")
      .select("id, uploaded_at, behaviors, antecedent_note, location")
      .eq("child_id", child.id)
      .eq("is_deleted", false)
      .order("uploaded_at", { ascending: false })
      .limit(5),
    supabase
      .from("clips")
      .select("id", { count: "exact", head: true })
      .eq("child_id", child.id)
      .eq("is_deleted", false)
      .gte("uploaded_at", weekAgo),
    supabase
      .from("clip_tags")
      .select("value, clip_id, clips!inner(child_id, is_deleted)")
      .eq("category", "BEHAVIOR")
      .eq("clips.child_id", child.id)
      .eq("clips.is_deleted", false),
    supabase
      .from("observation_missions")
      .select(
        "id, prompt, status, due_date, assigned_by_name, created_at",
      )
      .eq("child_id", child.id)
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("therapy_schedules")
      .select("therapy_type, day_of_week, time_of_day, provider_name, is_active")
      .eq("child_id", child.id),
  ]);

  const tally = new Map<string, number>();
  ((tagRows ?? []) as { value: string }[]).forEach((r) =>
    tally.set(r.value, (tally.get(r.value) ?? 0) + 1),
  );
  const topBehavior =
    [...tally.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const upcoming = computeUpcomingTherapy(child.id, schedules ?? []);

  return {
    name: greetingName,
    child,
    clipsThisWeek: weeklyCount ?? 0,
    topBehavior,
    recentClips: (recent ?? []) as RecentClip[],
    activeMissions: (missions ?? []) as MissionData[],
    upcoming,
  };
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function HomePage() {
  const {
    name,
    child,
    clipsThisWeek,
    topBehavior,
    recentClips,
    activeMissions,
    upcoming,
  } = await getContext();
  const isEmpty = recentClips.length === 0;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-neutral-500">{greeting()},</p>
        <h1 className="text-2xl font-semibold text-neutral-900">{name}</h1>
        {child && (
          <p className="mt-1 text-sm text-neutral-600">
            Documenting{" "}
            <span className="font-medium text-neutral-800">{child.name}</span>'s
            story.
          </p>
        )}
      </header>

      {upcoming && <SessionPrepBanner upcoming={upcoming} />}

      {activeMissions.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Active missions
            </h3>
            <Link
              href="/missions"
              className="inline-flex items-center text-xs font-medium text-primary-600 hover:underline"
            >
              All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="space-y-2">
            {activeMissions.map((m) => (
              <li key={m.id}>
                <MissionCard mission={m} showRecordCta canComplete />
              </li>
            ))}
          </ul>
        </section>
      )}

      {isEmpty && (
        <Card className="flex items-start gap-3 border-primary-100 bg-primary-50/60">
          <Sparkles className="h-5 w-5 text-primary-600 mt-0.5" />
          <div>
            <h2 className="text-base font-semibold text-neutral-900">
              Your timeline is empty
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Record your first clip to start building{" "}
              {child ? `${child.name}'s` : "your child's"} story.
            </p>
          </div>
        </Card>
      )}

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          This week
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center">
            <div className="font-mono text-2xl font-semibold text-neutral-900">
              {clipsThisWeek}
            </div>
            <div className="text-xs text-neutral-500">Clips</div>
          </Card>
          <Card className="text-center">
            <div className="truncate font-mono text-sm font-semibold text-neutral-900">
              {topBehavior ?? "—"}
            </div>
            <div className="mt-1 text-xs text-neutral-500">Top behavior</div>
          </Card>
          <Card className="text-center">
            <div className="font-mono text-2xl font-semibold text-neutral-900">
              {upcoming
                ? Math.max(
                    0,
                    Math.round(
                      (upcoming.startsAt.getTime() - Date.now()) /
                        (60 * 60 * 1000),
                    ),
                  ) + "h"
                : "—"}
            </div>
            <div className="text-xs text-neutral-500">To therapy</div>
          </Card>
        </div>
      </section>

      {recentClips.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Recent clips
          </h3>
          <ul className="space-y-2">
            {recentClips.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/clips/${c.id}`}
                  className="flex items-start gap-3 rounded-xl border border-neutral-100 bg-white p-3 transition hover:shadow-md"
                >
                  <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-neutral-100" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-1.5">
                      {c.behaviors.slice(0, 3).map((b) => (
                        <span
                          key={b}
                          className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700"
                        >
                          {b}
                        </span>
                      ))}
                      {c.behaviors.length > 3 && (
                        <span className="text-xs text-neutral-400">
                          +{c.behaviors.length - 3}
                        </span>
                      )}
                    </div>
                    {c.antecedent_note && (
                      <p className="mt-1 line-clamp-1 text-sm text-neutral-700">
                        {c.antecedent_note}
                      </p>
                    )}
                    <p className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                      <span>
                        {formatDistanceToNow(new Date(c.uploaded_at), {
                          addSuffix: true,
                        })}
                      </span>
                      {c.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {c.location}
                        </span>
                      )}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <UploadButton />
    </div>
  );
}
