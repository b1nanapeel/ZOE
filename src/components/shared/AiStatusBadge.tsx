"use client";

import { useEffect, useState } from "react";
import { Sparkles, MoonStar } from "lucide-react";

interface Status {
  configured: boolean;
  available: boolean;
  isDailyLimitReached: boolean;
  waitSeconds: number;
}

export function AiStatusBadge() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/ai-status", { cache: "no-store" });
        const body = (await res.json()) as Status;
        if (!cancelled) setStatus(body);
      } catch {
        if (!cancelled) setStatus(null);
      }
    }
    load();
    const interval = window.setInterval(load, 30_000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  if (!status || !status.configured) return null;

  if (status.available) {
    return (
      <p className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
        <span
          aria-hidden
          className="inline-block h-2 w-2 rounded-full bg-primary-500 shadow-[0_0_6px_rgba(201,168,76,0.7)]"
        />
        AI active
      </p>
    );
  }

  if (status.isDailyLimitReached) {
    return (
      <p className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
        <MoonStar className="h-3.5 w-3.5 text-secondary-700" />
        AI analysis resumes tomorrow
      </p>
    );
  }

  const minutes = Math.ceil(status.waitSeconds / 60);
  return (
    <p className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
      <Sparkles className="h-3.5 w-3.5 text-primary-500" />
      AI analysis resumes in {minutes === 1 ? "1 minute" : `${minutes} minutes`}
    </p>
  );
}
