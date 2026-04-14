import { NextResponse } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";
import { userDisplayName } from "@/lib/auth-helpers";

const CreateSchema = z.object({
  prompt: z.string().min(1).max(500),
  dueDate: z.string().nullish(),
});

export async function GET(
  request: Request,
  context: { params: Promise<{ childId: string }> },
) {
  if (!isSupabaseConfigured())
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  const { childId } = await context.params;
  const url = new URL(request.url);
  const status = url.searchParams.get("status");

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let q = supabase
    .from("observation_missions")
    .select("id, prompt, status, due_date, assigned_by_id, assigned_by_name, created_at, completed_at")
    .eq("child_id", childId)
    .order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);

  const { data, error } = await q;
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ missions: data ?? [] });
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
  const parsed = CreateSchema.safeParse(raw);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid mission.", issues: parsed.error.flatten() },
      { status: 400 },
    );

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { data: membership } = await supabase
    .from("care_team_members")
    .select("role, status")
    .eq("child_id", childId)
    .eq("status", "ACCEPTED")
    .or(`user_id.eq.${user.id},email.eq.${(user.email ?? "").toLowerCase()}`)
    .maybeSingle();

  if (!membership || membership.role !== "THERAPIST") {
    return NextResponse.json(
      { error: "Only therapists on the care team can create missions." },
      { status: 403 },
    );
  }

  const { data, error } = await supabase
    .from("observation_missions")
    .insert({
      child_id: childId,
      assigned_by_id: user.id,
      assigned_by_name: userDisplayName(user),
      prompt: parsed.data.prompt.trim(),
      due_date: parsed.data.dueDate || null,
    })
    .select("id, prompt, status, due_date, assigned_by_name, created_at")
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ mission: data });
}
