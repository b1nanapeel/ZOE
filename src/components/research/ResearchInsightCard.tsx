"use client";

import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import type { ResearchInsight } from "@/lib/research-search";
import { useShowInsights } from "./InsightsToggle";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

type Vote = "up" | "down" | null;

export type InsightPageContext =
  | "patterns"
  | "clip-detail"
  | "session-prep"
  | string;

export function ResearchInsightCard({
  insight,
  behavioralQuery,
  pageContext,
}: {
  insight: ResearchInsight;
  behavioralQuery?: string;
  pageContext?: InsightPageContext;
}) {
  const show = useShowInsights();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [vote, setVote] = useState<Vote>(null);
  const [showDownForm, setShowDownForm] = useState(false);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!show) return null;

  async function send(rating: "UP" | "DOWN", feedbackNote?: string) {
    setSubmitting(true);
    try {
      await fetch("/api/research/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chunkId: insight.chunkId,
          rating,
          insightText: insight.template,
          behavioralContext: behavioralQuery ?? null,
          feedbackNote: feedbackNote?.trim() || null,
        }),
        keepalive: true,
      });
      toast({
        title: "Thanks for your feedback",
        description:
          rating === "UP"
            ? "Glad this was useful."
            : "We'll use this to improve insight quality.",
      });
    } catch {
      toast({ title: "Could not save feedback", variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  function handleUp() {
    if (vote === "up") return;
    setVote("up");
    setShowDownForm(false);
    send("UP");
  }

  function handleDown() {
    if (vote === "down") {
      setShowDownForm((s) => !s);
      return;
    }
    setVote("down");
    setShowDownForm(true);
    send("DOWN");
  }

  function submitNote() {
    if (!note.trim()) {
      setShowDownForm(false);
      return;
    }
    send("DOWN", note);
    setNote("");
    setShowDownForm(false);
  }

  const meta = [insight.authors, insight.year].filter(Boolean).join(" · ");

  return (
    <article className="rounded-xl border border-l-4 border-l-primary-500 border-neutral-200 bg-neutral-100 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-500/15 text-primary-500">
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-relaxed text-neutral-800">
            {insight.template}
          </p>
          <p className="mt-2 text-xs text-neutral-500">
            <span className="font-medium text-neutral-600">
              {insight.paperTitle}
            </span>
            {meta && <span> · {meta}</span>}
          </p>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary-500 hover:text-primary-400"
          >
            {open ? (
              <>
                <ChevronUp className="h-3 w-3" /> Hide source
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" /> View source
              </>
            )}
          </button>

          {open && (
            <p className="mt-2 max-h-56 overflow-y-auto whitespace-pre-wrap rounded-lg border border-neutral-200 bg-neutral-50/40 p-3 text-xs leading-relaxed text-neutral-700">
              {insight.chunkContent}
            </p>
          )}

          {showDownForm && (
            <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50/40 p-3">
              <label className="mb-1 block text-xs font-medium text-neutral-600">
                What's wrong with this insight? (optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Off topic, outdated, low quality…"
                className="w-full rounded-lg border border-neutral-200 bg-neutral-100 px-2 py-1.5 text-xs text-neutral-800 placeholder:text-neutral-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 focus:outline-none"
              />
              <div className="mt-2 flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowDownForm(false);
                    setNote("");
                  }}
                  disabled={submitting}
                >
                  Skip
                </Button>
                <Button size="sm" onClick={submitNote} disabled={submitting}>
                  Send
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex justify-end gap-1">
        <button
          type="button"
          onClick={handleUp}
          aria-pressed={vote === "up"}
          aria-label="Helpful"
          disabled={submitting}
          className={`rounded-md p-1.5 transition ${
            vote === "up"
              ? "bg-primary-500/15 text-primary-500"
              : "text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600"
          }`}
        >
          <ThumbsUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleDown}
          aria-pressed={vote === "down"}
          aria-label="Not relevant"
          disabled={submitting}
          className={`rounded-md p-1.5 transition ${
            vote === "down"
              ? "bg-red-500/15 text-red-400"
              : "text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600"
          }`}
        >
          <ThumbsDown className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

export function ResearchInsightList({
  insights,
  behavioralQuery,
  pageContext,
}: {
  insights: ResearchInsight[];
  behavioralQuery?: string;
  pageContext?: InsightPageContext;
}) {
  const logged = useRef(false);

  useEffect(() => {
    if (logged.current || insights.length === 0) return;
    logged.current = true;
    fetch("/api/research/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chunksUsed: insights.map((i) => i.chunkId),
        behavioralQuery: behavioralQuery ?? null,
        generatedInsight: insights.map((i) => i.template).join("\n\n"),
        pageContext: pageContext ?? null,
      }),
      keepalive: true,
    }).catch(() => {});
  }, [insights, behavioralQuery, pageContext]);

  if (insights.length === 0) return null;
  return (
    <div className="space-y-2">
      {insights.map((i, idx) => (
        <ResearchInsightCard
          key={`${i.chunkId}-${idx}`}
          insight={i}
          behavioralQuery={behavioralQuery}
          pageContext={pageContext}
        />
      ))}
    </div>
  );
}
