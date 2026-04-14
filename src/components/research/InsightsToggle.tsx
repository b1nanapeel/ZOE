"use client";

import { useEffect, useState } from "react";

const PREF_KEY = "zoe.userPreferences";

export interface UserPreferences {
  showResearchInsights: boolean;
}

const DEFAULT: UserPreferences = { showResearchInsights: true };

function loadPrefs(): UserPreferences {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT;
  }
}

function savePrefs(prefs: UserPreferences) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
  window.dispatchEvent(new Event("zoe:prefs-changed"));
}

export function useShowInsights(): boolean {
  const [show, setShow] = useState<boolean>(true);
  useEffect(() => {
    setShow(loadPrefs().showResearchInsights);
    const handler = () => setShow(loadPrefs().showResearchInsights);
    window.addEventListener("zoe:prefs-changed", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("zoe:prefs-changed", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return show;
}

export function ShowInsightsToggle() {
  const [enabled, setEnabled] = useState(true);
  useEffect(() => setEnabled(loadPrefs().showResearchInsights), []);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    savePrefs({ ...loadPrefs(), showResearchInsights: next });
  }

  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-100 p-4 cursor-pointer">
      <div className="min-w-0">
        <p className="text-sm font-medium text-neutral-900">
          Show research insights
        </p>
        <p className="mt-0.5 text-xs text-neutral-500">
          Display related study findings on patterns, clips, and session prep.
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={toggle}
        className={`relative h-7 w-12 flex-shrink-0 rounded-full transition ${
          enabled ? "bg-primary-500" : "bg-neutral-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-[#0f2035] transition-all ${
            enabled ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </label>
  );
}
