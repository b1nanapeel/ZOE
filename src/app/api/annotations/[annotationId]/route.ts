import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ annotationId: string }> },
) {
  if (!isSupabaseConfigured())
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  const { annotationId } = await context.params;

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { error } = await supabase
    .from("annotations")
    .delete()
    .eq("id", annotationId)
    .eq("author_id", user.id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
