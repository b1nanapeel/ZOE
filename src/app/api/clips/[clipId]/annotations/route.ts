import { NextResponse } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";
import { userDisplayName } from "@/lib/auth-helpers";

const NoteSchema = z.object({
  content: z.string().min(1).max(4000),
  isPrivate: z.boolean().default(false),
});

export async function GET(
  _request: Request,
  context: { params: Promise<{ clipId: string }> },
) {
  if (!isSupabaseConfigured())
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  const { clipId } = await context.params;

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { data, error } = await supabase
    .from("annotations")
    .select(
      "id, content, is_private, created_at, updated_at, author_id, author_name, author_role",
    )
    .eq("clip_id", clipId)
    .order("created_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ annotations: data ?? [] });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ clipId: string }> },
) {
  if (!isSupabaseConfigured())
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  const { clipId } = await context.params;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const parsed = NoteSchema.safeParse(raw);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid annotation.", issues: parsed.error.flatten() },
      { status: 400 },
    );

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  // Look up the user's care team membership for this clip's child
  const { data: clip } = await supabase
    .from("clips")
    .select("child_id")
    .eq("id", clipId)
    .maybeSingle();
  if (!clip)
    return NextResponse.json({ error: "Clip not found." }, { status: 404 });

  const { data: membership } = await supabase
    .from("care_team_members")
    .select("role, status")
    .eq("child_id", clip.child_id)
    .eq("status", "ACCEPTED")
    .or(
      `user_id.eq.${user.id},email.eq.${(user.email ?? "").toLowerCase()}`,
    )
    .maybeSingle();

  if (!membership || membership.role !== "THERAPIST") {
    return NextResponse.json(
      { error: "Only therapists on the care team can annotate." },
      { status: 403 },
    );
  }

  const { data, error } = await supabase
    .from("annotations")
    .insert({
      clip_id: clipId,
      author_id: user.id,
      author_name: userDisplayName(user),
      author_role: "THERAPIST",
      content: parsed.data.content.trim(),
      is_private: parsed.data.isPrivate,
    })
    .select(
      "id, content, is_private, created_at, updated_at, author_id, author_name, author_role",
    )
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ annotation: data });
}
