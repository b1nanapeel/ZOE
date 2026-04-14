import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { buildFrequency } from "@/lib/patterns";
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
  const weeks = Math.min(
    Math.max(Number(url.searchParams.get("weeks") ?? 8), 1),
    52,
  );
  const behaviorsParam = url.searchParams.get("behaviors");
  const filter = behaviorsParam
    ? behaviorsParam.split(",").map((s) => s.trim()).filter(Boolean)
    : undefined;

  const { clips, ownsChild, userId } = await loadPatternClips(childId, weeks);
  if (!userId)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  if (!ownsChild)
    return NextResponse.json({ error: "Not found." }, { status: 404 });

  return NextResponse.json(buildFrequency(clips, weeks, filter));
}
