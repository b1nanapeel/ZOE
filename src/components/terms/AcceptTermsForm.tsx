"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AcceptTermsForm() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    if (!checked) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/terms/accept", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Could not save.");
      }
      router.replace("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <label className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-100 p-4 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-0.5 h-5 w-5 flex-shrink-0 rounded border-neutral-300 text-primary-500 focus:ring-primary-500/30"
        />
        <span className="text-sm text-neutral-800">
          I have read and agree to ZOE's{" "}
          <Link
            href="/terms"
            target="_blank"
            className="font-medium text-primary-500 underline"
          >
            Terms &amp; Conditions
          </Link>
          .
        </span>
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button
        block
        disabled={!checked || submitting}
        onClick={accept}
      >
        {submitting ? "Saving…" : "Continue"}
      </Button>

      <p className="text-center text-xs text-neutral-500">
        You can change preferences and delete your account anytime from your
        Profile.
      </p>
    </div>
  );
}
