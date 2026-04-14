import { createServerSupabase } from "./supabase-server";
import {
  buildSessionPrep,
  type ActiveMission,
  type SessionPrepClip,
  type SessionPrepSummary,
} from "./session-prep";

export async function loadSessionPrep(
  childId: string,
  from: Date,
  to: Date,
): Promise<{
  summary: SessionPrepSummary | null;
  childName: string | null;
  authorized: boolean;
}> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { summary: null, childName: null, authorized: false };

  const { data: child } = await supabase
    .from("children")
    .select("id, name")
    .eq("id", childId)
    .maybeSingle();
  if (!child) return { summary: null, childName: null, authorized: false };

  const cols =
    "id, uploaded_at, behaviors, antecedents, location, parent_interpretation, parent_feeling";

  const [{ data: clipsInPeriod }, { data: clipsBeforePeriod }, { data: missions }, { count: completions }] =
    await Promise.all([
      supabase
        .from("clips")
        .select(cols)
        .eq("child_id", childId)
        .eq("is_deleted", false)
        .gte("uploaded_at", from.toISOString())
        .lte("uploaded_at", to.toISOString())
        .order("uploaded_at", { ascending: false }),
      supabase
        .from("clips")
        .select("behaviors")
        .eq("child_id", childId)
        .eq("is_deleted", false)
        .lt("uploaded_at", from.toISOString()),
      supabase
        .from("observation_missions")
        .select("id, prompt, status, due_date, assigned_by_name")
        .eq("child_id", childId)
        .order("created_at", { ascending: false }),
      supabase
        .from("observation_missions")
        .select("id", { count: "exact", head: true })
        .eq("child_id", childId)
        .eq("status", "COMPLETED")
        .gte("completed_at", from.toISOString())
        .lte("completed_at", to.toISOString()),
    ]);

  const summary = buildSessionPrep({
    clipsInPeriod: (clipsInPeriod ?? []) as SessionPrepClip[],
    clipsBeforePeriod: ((clipsBeforePeriod ?? []) as { behaviors: string[] }[]).map(
      (c) =>
        ({
          id: "",
          uploaded_at: "",
          behaviors: c.behaviors,
          antecedents: [],
          location: null,
          parent_interpretation: null,
          parent_feeling: null,
        }) as SessionPrepClip,
    ),
    missions: (missions ?? []) as ActiveMission[],
    missionCompletions: completions ?? 0,
    from,
    to,
  });

  return { summary, childName: child.name, authorized: true };
}
