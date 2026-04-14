import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(
  request: Request,
  context: { params: Promise<{ childId: string }> },
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 },
    );
  }
  const { childId } = await context.params;
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 200);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  const location = url.searchParams.get("location");
  const behavior = url.searchParams.get("behavior");

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let q = supabase
    .from("clips")
    .select(
      "id, uploaded_at, thumbnail_url, behaviors, antecedent_note, location, duration_seconds, mood_before",
      { count: "exact" },
    )
    .eq("child_id", childId)
    .eq("is_deleted", false)
    .order("uploaded_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (startDate) q = q.gte("uploaded_at", startDate);
  if (endDate) q = q.lte("uploaded_at", endDate);
  if (location) q = q.eq("location", location);
  if (behavior) q = q.contains("behaviors", [behavior]);

  const { data, error, count } = await q;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    clips: data ?? [],
    total: count ?? 0,
    limit,
    offset,
  });
}
