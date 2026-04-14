"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function AddAnnotation({ clipId }: { clipId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/clips/${clipId}/annotations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, isPrivate }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Could not save annotation.");
      }
      setContent("");
      setIsPrivate(false);
      toast({ title: "Note added" });
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not save annotation.";
      setError(msg);
      toast({ title: "Could not save", description: msg, variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder="Add a clinical note…"
        className="w-full resize-none rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 focus:outline-none"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <label className="inline-flex items-center gap-2 text-xs text-neutral-600">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500/30"
          />
          Private (care team only)
        </label>
        <Button
          size="sm"
          onClick={submit}
          disabled={submitting || !content.trim()}
        >
          {submitting ? "Saving…" : "Add note"}
        </Button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
