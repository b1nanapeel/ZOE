import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { buildContextMatrix } from "@/lib/patterns";
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
  const source = (url.searchParams.get("source") === "location"
    ? "location"
    : "antecedents") as "antecedents" | "location";
  const weeks = Math.min(
    Math.max(Number(url.searchParams.get("weeks") ?? 12), 1),
    52,
  );

  const { clips, ownsChild, userId } = await loadPatternClips(childId, weeks);
  if (!userId)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  if (!ownsChild)
    return NextResponse.json({ error: "Not found." }, { status: 404 });

  return NextResponse.json({ matrix: buildContextMatrix(clips, source) });
}
