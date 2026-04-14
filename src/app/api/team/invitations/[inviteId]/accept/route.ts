import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ inviteId: string }> },
) {
  if (!isSupabaseConfigured())
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  const { inviteId } = await context.params;

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { data, error } = await supabase
    .from("care_team_members")
    .update({
      status: "ACCEPTED",
      user_id: user.id,
      joined_at: new Date().toISOString(),
    })
    .eq("id", inviteId)
    .select("id, child_id, role, status")
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ membership: data });
}
