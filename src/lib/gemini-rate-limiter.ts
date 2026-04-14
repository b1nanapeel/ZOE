// HARD global rate limiter for Gemini.
// Free-tier safety: 9 requests / 60s rolling window, 240 / day.
// Daily counter keyed by Pacific Time date (auto-resets at PT midnight).
// canMakeRequest() returning true is the ONLY way a call is permitted.

const RPM_LIMIT = 9;
const RPD_LIMIT = 240;
const WINDOW_MS = 60_000;

const minuteTimestamps: number[] = [];
let dailyKey: string = ptDayKey(new Date());
let dailyCount = 0;
// If Gemini itself returns 429, lock the per-minute window.
let forcedMinuteFullUntil = 0;

function ptDayKey(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function ptOffsetMinutes(at: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    timeZoneName: "shortOffset",
  }).formatToParts(at);
  const off = parts.find((p) => p.type === "timeZoneName")?.value || "GMT-8";
  const m = off.match(/GMT([+-]?\d+)/);
  return m ? Number(m[1]) * 60 : -480;
}

function nextPtMidnight(now: Date): Date {
  const offsetMin = ptOffsetMinutes(now);
  const ptNowMs = now.getTime() + offsetMin * 60_000;
  const ptNow = new Date(ptNowMs);
  ptNow.setUTCHours(24, 0, 0, 0);
  return new Date(ptNow.getTime() - offsetMin * 60_000);
}

function refreshDaily() {
  const key = ptDayKey(new Date());
  if (key !== dailyKey) {
    dailyKey = key;
    dailyCount = 0;
  }
}

function pruneOld(now: number) {
  while (minuteTimestamps.length > 0 && minuteTimestamps[0] < now - WINDOW_MS) {
    minuteTimestamps.shift();
  }
}

export interface GeminiStatus {
  available: boolean;
  remainingPerMinute: number;
  remainingPerDay: number;
  nextAvailableAt: number;
  minuteResetAt: number;
  dailyResetAt: number;
  waitSeconds: number;
  isDailyLimitReached: boolean;
  limit: { perMinute: number; perDay: number };
}

export function canMakeRequest(): boolean {
  refreshDaily();
  const now = Date.now();
  pruneOld(now);
  if (now < forcedMinuteFullUntil) return false;
  if (minuteTimestamps.length >= RPM_LIMIT) return false;
  if (dailyCount >= RPD_LIMIT) return false;
  return true;
}

export function recordRequest(): void {
  refreshDaily();
  const now = Date.now();
  pruneOld(now);
  minuteTimestamps.push(now);
  dailyCount += 1;
}

// Called when Gemini itself returns 429 — instantly locks the minute window.
export function markMinuteFull(): void {
  forcedMinuteFullUntil = Date.now() + WINDOW_MS;
}

export function getStatus(): GeminiStatus {
  refreshDaily();
  const now = Date.now();
  pruneOld(now);
  const isDailyLimitReached = dailyCount >= RPD_LIMIT;
  const minuteCount = minuteTimestamps.length;
  const minuteFull =
    minuteCount >= RPM_LIMIT || now < forcedMinuteFullUntil;

  let minuteResetAt: number;
  if (now < forcedMinuteFullUntil) {
    minuteResetAt = forcedMinuteFullUntil;
  } else if (minuteCount >= RPM_LIMIT && minuteTimestamps.length > 0) {
    minuteResetAt = minuteTimestamps[0] + WINDOW_MS;
  } else {
    minuteResetAt = now;
  }
  const dailyResetAt = nextPtMidnight(new Date(now)).getTime();
  const nextAvailableAt = isDailyLimitReached
    ? dailyResetAt
    : minuteFull
      ? minuteResetAt
      : now;

  return {
    available: !isDailyLimitReached && !minuteFull,
    remainingPerMinute: Math.max(0, RPM_LIMIT - minuteCount),
    remainingPerDay: Math.max(0, RPD_LIMIT - dailyCount),
    nextAvailableAt,
    minuteResetAt,
    dailyResetAt,
    waitSeconds: Math.max(0, Math.ceil((nextAvailableAt - now) / 1000)),
    isDailyLimitReached,
    limit: { perMinute: RPM_LIMIT, perDay: RPD_LIMIT },
  };
}
