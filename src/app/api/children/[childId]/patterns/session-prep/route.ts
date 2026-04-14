import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { loadSessionPrep } from "@/lib/session-prep-server";

export async function GET(
  request: Request,
  context: { params: Promise<{ childId: string }> },
) {
  if (!isSupabaseConfigured())
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  const { childId } = await context.params;
  const url = new URL(request.url);
  const to = url.searchParams.get("to")
    ? new Date(url.searchParams.get("to")!)
    : new Date();
  const from = url.searchParams.get("from")
    ? new Date(url.searchParams.get("from")!)
    : new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);

  const { summary, authorized } = await loadSessionPrep(childId, from, to);
  if (!authorized)
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json(summary);
}
