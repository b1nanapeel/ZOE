import { NextResponse } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";

const Schema = z.object({
  chunkId: z.string().min(1),
  rating: z.enum(["UP", "DOWN"]),
  insightText: z.string().nullish(),
  behavioralContext: z.string().nullish(),
  feedbackNote: z.string().nullish(),
});

export async function POST(request: Request) {
  if (!isSupabaseConfigured())
    return NextResponse.json({ error: "Not configured." }, { status: 500 });

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const parsed = Schema.safeParse(raw);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid feedback." }, { status: 400 });

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { error } = await supabase.from("research_feedback").insert({
    chunk_id: parsed.data.chunkId,
    rating: parsed.data.rating,
    insight_text: parsed.data.insightText ?? null,
    behavioral_context: parsed.data.behavioralContext ?? null,
    feedback_note: parsed.data.feedbackNote ?? null,
    user_id: user.id,
    user_role: (user.user_metadata as { role?: string } | undefined)?.role ?? null,
  });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
