import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase-admin";

export async function DELETE() {
  if (!isSupabaseConfigured())
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  if (!isAdminConfigured())
    return NextResponse.json(
      {
        error:
          "SUPABASE_SERVICE_ROLE_KEY is not set. Account deletion requires it.",
      },
      { status: 500 },
    );

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  // Cascade deletes wipe children/clips/tags/missions/team via FKs.
  await supabase.from("children").delete().eq("parent_id", user.id);

  // Best-effort: clean up any storage objects under <user.id>/...
  const admin = createAdminClient();
  const { data: files } = await admin.storage.from("clips").list(user.id);
  if (files && files.length) {
    await admin.storage
      .from("clips")
      .remove(files.map((f) => `${user.id}/${f.name}`));
  }

  const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
  if (delErr)
    return NextResponse.json({ error: delErr.message }, { status: 500 });

  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
