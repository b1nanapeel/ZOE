import { NextResponse } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/admin";

const PatchSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ paperId: string }> },
) {
  if (!isSupabaseConfigured())
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  const { paperId } = await context.params;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const parsed = PatchSchema.safeParse(raw);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdmin(user))
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const update: Record<string, unknown> = { status: parsed.data.status };
  if (parsed.data.status === "APPROVED")
    update.approved_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("research_papers")
    .update(update)
    .eq("id", paperId)
    .select("id, status, approved_at")
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ paper: data });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ paperId: string }> },
) {
  if (!isSupabaseConfigured())
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  const { paperId } = await context.params;

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdmin(user))
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const { data: paper } = await supabase
    .from("research_papers")
    .select("pdf_storage_path")
    .eq("id", paperId)
    .maybeSingle();

  const { error } = await supabase
    .from("research_papers")
    .delete()
    .eq("id", paperId);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  if (paper?.pdf_storage_path) {
    await supabase.storage.from("research").remove([paper.pdf_storage_path]);
  }

  return NextResponse.json({ ok: true });
}
