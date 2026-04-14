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
  aiSuggestedBehaviors: z.array(z.string()).nullish(),
  aiSuggestedAntecedents: z.array(z.string()).nullish(),
  aiSuggestedConsequences: z.array(z.string()).nullish(),
  aiSuggestedMood: z.string().nullish(),
  audioFeatures: z.record(z.string(), z.unknown()).nullish(),
  movementFeatures: z.record(z.string(), z.unknown()).nullish(),
});

function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1;
  const A = new Set(a);
  const B = new Set(b);
  let inter = 0;
  A.forEach((x) => {
    if (B.has(x)) inter += 1;
  });
  const union = A.size + B.size - inter;
  return union === 0 ? 1 : inter / union;
}

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

  // AI feedback loop — silent, never blocks save.
  const hasAiSuggestions =
    v.aiObservation ||
    (v.aiSuggestedBehaviors && v.aiSuggestedBehaviors.length > 0) ||
    (v.aiSuggestedAntecedents && v.aiSuggestedAntecedents.length > 0) ||
    (v.aiSuggestedConsequences && v.aiSuggestedConsequences.length > 0) ||
    v.aiSuggestedMood;
  if (hasAiSuggestions) {
    const aiB = v.aiSuggestedBehaviors ?? [];
    const aiA = v.aiSuggestedAntecedents ?? [];
    const aiC = v.aiSuggestedConsequences ?? [];
    const moodMatch =
      v.aiSuggestedMood && v.moodBefore
        ? v.aiSuggestedMood === v.moodBefore
          ? 1
          : 0
        : null;
    const parts = [
      jaccard(aiB, v.behaviors),
      jaccard(aiA, v.antecedents),
      jaccard(aiC, v.consequences),
      ...(moodMatch === null ? [] : [moodMatch]),
    ];
    const accuracy =
      parts.reduce((s, n) => s + n, 0) / Math.max(1, parts.length);
    await supabase.from("ai_feedback_loop").insert({
      clip_id: clip.id,
      ai_suggested_behaviors: aiB,
      parent_final_behaviors: v.behaviors,
      ai_suggested_antecedents: aiA,
      parent_final_antecedents: v.antecedents,
      ai_suggested_consequences: aiC,
      parent_final_consequences: v.consequences,
      ai_suggested_mood: v.aiSuggestedMood ?? null,
      parent_final_mood: v.moodBefore ?? null,
      ai_confidence: v.aiConfidence ?? null,
      accuracy_score: Math.round(accuracy * 1000) / 1000,
    });
    // Intentionally ignore insert errors — must never block save.
  }

  return NextResponse.json({ clipId: clip.id });
}
