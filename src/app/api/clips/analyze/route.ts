import { NextResponse } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";
import {
  canMakeRequest,
  getStatus,
  recordRequest,
} from "@/lib/gemini-rate-limiter";
import { analyzeVideoWithGemini } from "@/lib/gemini-analysis";

export const runtime = "nodejs";
export const maxDuration = 30;

const Schema = z
  .object({
    clipId: z.string().min(1).optional(),
    videoPath: z.string().min(1).optional(),
    videoUrl: z.string().url().optional(),
  })
  .refine((v) => v.clipId || v.videoPath || v.videoUrl, {
    message: "Provide clipId, videoPath, or videoUrl",
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
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { skipped: true, reason: "AI not configured.", status: getStatus() },
      { status: 200 },
    );
  }
  // HARD gate — never call Gemini when the limiter says no.
  if (!canMakeRequest()) {
    const status = getStatus();
    return NextResponse.json(
      { skipped: true, reason: "Rate limited.", status },
      {
        status: 429,
        headers: {
          "Retry-After": Math.max(1, status.waitSeconds).toString(),
          "X-Gemini-Remaining-Minute":
            status.remainingPerMinute.toString(),
          "X-Gemini-Remaining-Day": status.remainingPerDay.toString(),
        },
      },
    );
  }

  // Resolve a fetchable URL for the video.
  let videoUrl = parsed.data.videoUrl ?? null;
  if (!videoUrl) {
    let path = parsed.data.videoPath ?? null;
    if (!path && parsed.data.clipId) {
      const { data: clip } = await supabase
        .from("clips")
        .select("video_url")
        .eq("id", parsed.data.clipId)
        .maybeSingle();
      path = clip?.video_url ?? null;
    }
    if (!path)
      return NextResponse.json(
        { skipped: true, reason: "No video found." },
        { status: 200 },
      );
    const { data: signed } = await supabase.storage
      .from("clips")
      .createSignedUrl(path, 60 * 5);
    videoUrl = signed?.signedUrl ?? null;
  }

  if (!videoUrl) {
    return NextResponse.json(
      { skipped: true, reason: "Could not sign video URL." },
      { status: 200 },
    );
  }

  recordRequest();

  const suggestions = await analyzeVideoWithGemini(videoUrl);
  if (!suggestions) {
    return NextResponse.json(
      { skipped: true, reason: "Analysis failed.", status: getStatus() },
      { status: 200 },
    );
  }

  return NextResponse.json({ suggestions, status: getStatus() });
}
