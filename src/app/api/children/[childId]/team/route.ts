import { NextResponse } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";

const InviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["THERAPIST", "FAMILY"]),
});

export async function GET(
  _request: Request,
  context: { params: Promise<{ childId: string }> },
) {
  if (!isSupabaseConfigured())
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  const { childId } = await context.params;

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { data, error } = await supabase
    .from("care_team_members")
    .select("id, email, role, status, invited_at, joined_at, user_id")
    .eq("child_id", childId)
    .order("invited_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ members: data ?? [] });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ childId: string }> },
) {
  if (!isSupabaseConfigured())
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  const { childId } = await context.params;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const parsed = InviteSchema.safeParse(raw);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid invite.", issues: parsed.error.flatten() },
      { status: 400 },
    );

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { data, error } = await supabase
    .from("care_team_members")
    .insert({
      child_id: childId,
      email: parsed.data.email.toLowerCase().trim(),
      role: parsed.data.role,
      status: "PENDING",
    })
    .select("id, email, role, status, invited_at, joined_at, user_id")
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ invitation: data });
}
