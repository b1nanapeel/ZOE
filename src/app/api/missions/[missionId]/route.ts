import { NextResponse } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";

const PatchSchema = z.object({
  status: z.enum(["ACTIVE", "COMPLETED", "EXPIRED"]),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ missionId: string }> },
) {
  if (!isSupabaseConfigured())
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  const { missionId } = await context.params;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const parsed = PatchSchema.safeParse(raw);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { data, error } = await supabase
    .from("observation_missions")
    .update({
      status: parsed.data.status,
      completed_at:
        parsed.data.status === "COMPLETED" ? new Date().toISOString() : null,
    })
    .eq("id", missionId)
    .select("id, status, completed_at")
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ mission: data });
}
