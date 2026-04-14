"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function OptOutToggle({ initial }: { initial: boolean }) {
  const { toast } = useToast();
  const [optedOut, setOptedOut] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    const next = !optedOut;
    setSaving(true);
    try {
      const res = await fetch("/api/terms/opt-out", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optedOut: next }),
      });
      if (!res.ok) throw new Error();
      setOptedOut(next);
      toast({
        title: next
          ? "Opted out of data improvement"
          : "Opted back in to data improvement",
        description: next
          ? "Your data will not be used for model improvement. This does not affect your access to any features."
          : "Thanks — anonymized patterns from your clips help us improve for everyone.",
      });
    } catch {
      toast({
        title: "Could not save preference",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-100 p-4 cursor-pointer">
      <div className="min-w-0">
        <p className="text-sm font-medium text-neutral-900">
          Opt out of data improvement
        </p>
        <p className="mt-0.5 text-xs text-neutral-500">
          Keep all features active but exclude your clips from anonymized
          pattern improvement.
        </p>
      </div>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={toggle}
        disabled={saving}
        aria-pressed={optedOut}
        className={
          optedOut
            ? "bg-primary-500 text-[#0f2035] border-primary-500 hover:bg-primary-600"
            : ""
        }
      >
        {optedOut ? "Opted out" : "Opt out"}
      </Button>
    </label>
  );
}
