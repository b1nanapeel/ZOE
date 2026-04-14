import { NextResponse } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";

const ClipSchema = z.object({
  childId: z.string().min(1),
  videoUrl: z.string().min(1),
  thumbnailUrl: z.string().nullish(),
  durationSeconds: z.number().int().nonnegative().default(0),
  fileSizeBytes: z.number().int().nonnegative().default(0),
  antecedents: z.array(z.string()).default([]),
  antecedentNote: z.string().nullish(),
  behaviors: z.array(z.string()).default([]),
  behaviorNote: z.string().nullish(),
  consequences: z.array(z.string()).default([]),
  consequenceNote: z.string().nullish(),
  location: z.string().nullish(),
  timeContext: z.string().nullish(),
  peoplePresent: z.array(z.string()).default([]),
  moodBefore: z.string().nullish(),
  parentInterpretation: z.string().nullish(),
  parentFeeling: z.string().nullish(),
  recordedAt: z.string().nullish(),
  aiObservation: z.string().nullish(),
  aiConfidence: z.number().nullish(),
  audioFeatures: z.record(z.string(), z.unknown()).nullish(),
  movementFeatures: z.record(z.string(), z.unknown()).nullish(),
});

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 },
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = ClipSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid clip data.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const v = parsed.data;

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: clip, error: clipError } = await supabase
    .from("clips")
    .insert({
      child_id: v.childId,
      uploaded_by_id: user.id,
      video_url: v.videoUrl,
      thumbnail_url: v.thumbnailUrl ?? null,
      duration_seconds: v.durationSeconds,
      file_size_bytes: v.fileSizeBytes,
      antecedents: v.antecedents,
      antecedent_note: v.antecedentNote ?? null,
      behaviors: v.behaviors,
      behavior_note: v.behaviorNote ?? null,
      consequences: v.consequences,
      consequence_note: v.consequenceNote ?? null,
      location: v.location ?? null,
      time_context: v.timeContext ?? null,
      people_present: v.peoplePresent,
      mood_before: v.moodBefore ?? null,
      parent_interpretation: v.parentInterpretation ?? null,
      parent_feeling: v.parentFeeling ?? null,
      recorded_at: v.recordedAt ?? null,
      ai_observation: v.aiObservation ?? null,
      ai_confidence: v.aiConfidence ?? null,
      audio_features: v.audioFeatures ?? null,
      movement_features: v.movementFeatures ?? null,
    })
    .select("id")
    .single();

  if (clipError || !clip) {
    return NextResponse.json(
      { error: clipError?.message || "Could not save clip." },
      { status: 500 },
    );
  }

  const tagRows: { clip_id: string; category: string; value: string }[] = [];
  v.antecedents.forEach((value) =>
    tagRows.push({ clip_id: clip.id, category: "ANTECEDENT", value }),
  );
  v.behaviors.forEach((value) =>
    tagRows.push({ clip_id: clip.id, category: "BEHAVIOR", value }),
  );
  v.consequences.forEach((value) =>
    tagRows.push({ clip_id: clip.id, category: "CONSEQUENCE", value }),
  );
  if (v.location)
    tagRows.push({ clip_id: clip.id, category: "LOCATION", value: v.location });
  if (v.timeContext)
    tagRows.push({
      clip_id: clip.id,
      category: "TIME_CONTEXT",
      value: v.timeContext,
    });
  v.peoplePresent.forEach((value) =>
    tagRows.push({ clip_id: clip.id, category: "PEOPLE_PRESENT", value }),
  );
  if (v.moodBefore)
    tagRows.push({ clip_id: clip.id, category: "MOOD", value: v.moodBefore });

  if (tagRows.length > 0) {
    const { error: tagError } = await supabase.from("clip_tags").insert(tagRows);
    if (tagError) {
      return NextResponse.json(
        { error: tagError.message, clipId: clip.id },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ clipId: clip.id });
}
