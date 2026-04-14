import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { buildTrends } from "@/lib/patterns";
import { loadPatternClips } from "@/lib/patterns-server";

export async function GET(
  request: Request,
  context: { params: Promise<{ childId: string }> },
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }
  const { childId } = await context.params;
  const url = new URL(request.url);
  const periodWeeks = Math.min(
    Math.max(Number(url.searchParams.get("periodWeeks") ?? 4), 1),
    26,
  );

  const { clips, ownsChild, userId } = await loadPatternClips(
    childId,
    periodWeeks * 2,
  );
  if (!userId)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  if (!ownsChild)
    return NextResponse.json({ error: "Not found." }, { status: 404 });

  return NextResponse.json({ trends: buildTrends(clips, periodWeeks) });
}
