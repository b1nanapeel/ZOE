// Simple in-memory per-IP rate limiter.
// Per-minute bucket — restarts on serverless cold boot, which is fine for a
// best-effort throttle. For multi-instance prod, swap in Upstash or KV.

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 60;

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
let lastSweep = 0;

function sweep(now: number) {
  if (now - lastSweep < WINDOW_MS) return;
  lastSweep = now;
  for (const [k, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(k);
  }
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  sweep(now);
  const existing = buckets.get(ip);
  if (!existing || existing.resetAt <= now) {
    const fresh: Bucket = { count: 1, resetAt: now + WINDOW_MS };
    buckets.set(ip, fresh);
    return {
      ok: true,
      remaining: MAX_PER_WINDOW - 1,
      resetAt: fresh.resetAt,
      limit: MAX_PER_WINDOW,
    };
  }
  existing.count += 1;
  return {
    ok: existing.count <= MAX_PER_WINDOW,
    remaining: Math.max(0, MAX_PER_WINDOW - existing.count),
    resetAt: existing.resetAt,
    limit: MAX_PER_WINDOW,
  };
}

export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
