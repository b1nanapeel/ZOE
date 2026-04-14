import { NextResponse } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";

const Schema = z.object({
  chunksUsed: z.array(z.string()).default([]),
  behavioralQuery: z.string().nullish(),
  generatedInsight: z.string().nullish(),
  pageContext: z.string().nullish(),
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
    return NextResponse.json({ error: "Invalid log." }, { status: 400 });

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { error } = await supabase.from("insight_logs").insert({
    chunks_used: parsed.data.chunksUsed,
    behavioral_query: parsed.data.behavioralQuery ?? null,
    generated_insight: parsed.data.generatedInsight ?? null,
    page_context: parsed.data.pageContext ?? null,
  });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
