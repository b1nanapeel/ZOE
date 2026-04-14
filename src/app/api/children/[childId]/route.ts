import { NextResponse } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";

const PatchSchema = z.object({
  name: z.string().min(1).optional(),
  dateOfBirth: z.string().optional(),
  communicationLevel: z
    .enum(["NONVERBAL", "MINIMALLY_VERBAL", "VERBAL_WITH_SUPPORT", "VERBAL"])
    .optional(),
  diagnosisStatus: z
    .enum(["DIAGNOSED", "IN_EVALUATION", "SUSPECTED", "OTHER"])
    .optional(),
  diagnosisDetails: z.string().nullish(),
  currentTherapies: z.array(z.string()).optional(),
  notes: z.string().nullish(),
});

export async function PATCH(
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
  const parsed = PatchSchema.safeParse(raw);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid update.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  const v = parsed.data;

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const update: Record<string, unknown> = {};
  if (v.name !== undefined) update.name = v.name;
  if (v.dateOfBirth !== undefined) update.date_of_birth = v.dateOfBirth;
  if (v.communicationLevel !== undefined)
    update.communication_level = v.communicationLevel;
  if (v.diagnosisStatus !== undefined)
    update.diagnosis_status = v.diagnosisStatus;
  if (v.diagnosisDetails !== undefined)
    update.diagnosis_details = v.diagnosisDetails || null;
  if (v.currentTherapies !== undefined)
    update.current_therapies = v.currentTherapies;
  if (v.notes !== undefined) update.notes = v.notes || null;

  const { data, error } = await supabase
    .from("children")
    .update(update)
    .eq("id", childId)
    .select("id")
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ childId: data.id });
}

export async function DELETE(
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

  const { error } = await supabase
    .from("children")
    .delete()
    .eq("id", childId)
    .eq("parent_id", user.id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
