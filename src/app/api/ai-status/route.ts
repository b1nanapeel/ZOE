import { NextResponse } from "next/server";
import { getStatus } from "@/lib/gemini-rate-limiter";

export async function GET() {
  const configured = Boolean(process.env.GEMINI_API_KEY);
  const status = getStatus();
  return NextResponse.json({
    configured,
    ...status,
    available: configured && status.available,
  });
}
