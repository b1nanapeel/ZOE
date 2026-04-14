import { NextResponse } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";

const Schema = z.object({ optedOut: z.boolean() });

export async function PATCH(request: Request) {
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
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  // Ensure a row exists; update the opt-out flag.
  const { error } = await supabase.from("user_terms_acceptance").upsert(
    {
      user_id: user.id,
      opted_out_of_training: parsed.data.optedOut,
    },
    { onConflict: "user_id" },
  );
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, optedOut: parsed.data.optedOut });
}
