import { createServerSupabase } from "./supabase-server";
import type { PatternClip } from "./patterns";

export async function loadPatternClips(
  childId: string,
  weeks: number,
): Promise<{ clips: PatternClip[]; ownsChild: boolean; userId: string | null }> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return { clips: [], ownsChild: false, userId: null };

  const { data: child } = await supabase
    .from("children")
    .select("id")
    .eq("id", childId)
    .eq("parent_id", user.id)
    .maybeSingle();
  if (!child)
    return { clips: [], ownsChild: false, userId: user.id };

  const since = new Date(
    Date.now() - weeks * 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data } = await supabase
    .from("clips")
    .select("uploaded_at, behaviors, antecedents, location")
    .eq("child_id", childId)
    .eq("is_deleted", false)
    .gte("uploaded_at", since)
    .order("uploaded_at", { ascending: false });

  return {
    clips: (data ?? []) as PatternClip[],
    ownsChild: true,
    userId: user.id,
  };
}
