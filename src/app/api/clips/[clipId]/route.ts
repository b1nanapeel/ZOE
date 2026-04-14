import { NextResponse } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";

const PatchSchema = z.object({
  antecedents: z.array(z.string()).optional(),
  antecedentNote: z.string().nullish(),
  behaviors: z.array(z.string()).optional(),
  behaviorNote: z.string().nullish(),
  consequences: z.array(z.string()).optional(),
  consequenceNote: z.string().nullish(),
  location: z.string().nullish(),
  timeContext: z.string().nullish(),
  peoplePresent: z.array(z.string()).optional(),
  moodBefore: z.string().nullish(),
  parentInterpretation: z.string().nullish(),
  parentFeeling: z.string().nullish(),
  isDeleted: z.boolean().optional(),
});

const SOFT_DELETE_GRACE_DAYS = 30;

export async function PATCH(
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
  const parsed = PatchSchema.safeParse(raw);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid clip update.", issues: parsed.error.flatten() },
      { status: 400 },
    );

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const v = parsed.data;
  const update: Record<string, unknown> = {};
  if (v.antecedents !== undefined) update.antecedents = v.antecedents;
  if (v.antecedentNote !== undefined)
    update.antecedent_note = v.antecedentNote || null;
  if (v.behaviors !== undefined) update.behaviors = v.behaviors;
  if (v.behaviorNote !== undefined)
    update.behavior_note = v.behaviorNote || null;
  if (v.consequences !== undefined) update.consequences = v.consequences;
  if (v.consequenceNote !== undefined)
    update.consequence_note = v.consequenceNote || null;
  if (v.location !== undefined) update.location = v.location || null;
  if (v.timeContext !== undefined) update.time_context = v.timeContext || null;
  if (v.peoplePresent !== undefined) update.people_present = v.peoplePresent;
  if (v.moodBefore !== undefined) update.mood_before = v.moodBefore || null;
  if (v.parentInterpretation !== undefined)
    update.parent_interpretation = v.parentInterpretation || null;
  if (v.parentFeeling !== undefined)
    update.parent_feeling = v.parentFeeling || null;
  if (v.isDeleted !== undefined) {
    update.is_deleted = v.isDeleted;
    update.deleted_at = v.isDeleted ? new Date().toISOString() : null;
  }

  const { data: clip, error } = await supabase
    .from("clips")
    .update(update)
    .eq("id", clipId)
    .select("id")
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // If tag arrays changed, rebuild the denormalized clip_tags rows.
  const tagsTouched =
    v.antecedents !== undefined ||
    v.behaviors !== undefined ||
    v.consequences !== undefined ||
    v.location !== undefined ||
    v.timeContext !== undefined ||
    v.peoplePresent !== undefined ||
    v.moodBefore !== undefined;

  if (tagsTouched) {
    await supabase.from("clip_tags").delete().eq("clip_id", clipId);
    const { data: full } = await supabase
      .from("clips")
      .select(
        "antecedents, behaviors, consequences, location, time_context, people_present, mood_before",
      )
      .eq("id", clipId)
      .single();
    if (full) {
      const rows: { clip_id: string; category: string; value: string }[] = [];
      full.antecedents?.forEach((value: string) =>
        rows.push({ clip_id: clipId, category: "ANTECEDENT", value }),
      );
      full.behaviors?.forEach((value: string) =>
        rows.push({ clip_id: clipId, category: "BEHAVIOR", value }),
      );
      full.consequences?.forEach((value: string) =>
        rows.push({ clip_id: clipId, category: "CONSEQUENCE", value }),
      );
      if (full.location)
        rows.push({
          clip_id: clipId,
          category: "LOCATION",
          value: full.location,
        });
      if (full.time_context)
        rows.push({
          clip_id: clipId,
          category: "TIME_CONTEXT",
          value: full.time_context,
        });
      full.people_present?.forEach((value: string) =>
        rows.push({ clip_id: clipId, category: "PEOPLE_PRESENT", value }),
      );
      if (full.mood_before)
        rows.push({
          clip_id: clipId,
          category: "MOOD",
          value: full.mood_before,
        });
      if (rows.length) await supabase.from("clip_tags").insert(rows);
    }
  }

  return NextResponse.json({ clipId: clip.id });
}

export async function DELETE(
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

  const { error } = await supabase
    .from("clips")
    .update({ is_deleted: true, deleted_at: new Date().toISOString() })
    .eq("id", clipId);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    ok: true,
    purgedAfterDays: SOFT_DELETE_GRACE_DAYS,
  });
}
