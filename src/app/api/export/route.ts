import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET() {
  if (!isSupabaseConfigured())
    return NextResponse.json({ error: "Not configured." }, { status: 500 });

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { data: children } = await supabase
    .from("children")
    .select("*")
    .eq("parent_id", user.id);
  const childIds = (children ?? []).map((c) => c.id);

  const [{ data: clips }, { data: tags }, { data: missions }, { data: schedules }, { data: team }] =
    childIds.length > 0
      ? await Promise.all([
          supabase.from("clips").select("*").in("child_id", childIds),
          supabase
            .from("clip_tags")
            .select("*")
            .in(
              "clip_id",
              (
                await supabase
                  .from("clips")
                  .select("id")
                  .in("child_id", childIds)
              ).data?.map((c) => c.id) ?? [],
            ),
          supabase
            .from("observation_missions")
            .select("*")
            .in("child_id", childIds),
          supabase
            .from("therapy_schedules")
            .select("*")
            .in("child_id", childIds),
          supabase
            .from("care_team_members")
            .select("*")
            .in("child_id", childIds),
        ])
      : [
          { data: [] },
          { data: [] },
          { data: [] },
          { data: [] },
          { data: [] },
        ];

  const clipIds = (clips ?? []).map((c) => c.id);
  const { data: annotations } = clipIds.length
    ? await supabase.from("annotations").select("*").in("clip_id", clipIds)
    : { data: [] };

  const payload = {
    exportedAt: new Date().toISOString(),
    user: { id: user.id, email: user.email },
    children: children ?? [],
    clips: clips ?? [],
    clipTags: tags ?? [],
    annotations: annotations ?? [],
    missions: missions ?? [],
    therapySchedules: schedules ?? [],
    careTeam: team ?? [],
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="zoe-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
