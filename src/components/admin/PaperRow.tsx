"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Trash2, Check, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export interface PaperRowData {
  id: string;
  title: string;
  authors: string | null;
  journal: string | null;
  doi: string | null;
  published_date: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  uploaded_at: string;
  approved_at: string | null;
}

export interface ChunkRowData {
  id: string;
  content: string;
  keywords: string[];
  chunk_index: number;
  section_type: string | null;
}

export interface PaperQualityScore {
  total: number;
  up: number;
  down: number;
  percentPositive: number | null;
}

export function PaperRow({
  paper,
  chunks,
  quality,
  initiallyOpen = false,
}: {
  paper: PaperRowData;
  chunks: ChunkRowData[];
  quality?: PaperQualityScore;
  initiallyOpen?: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(initiallyOpen);
  const [busy, setBusy] = useState(false);

  async function setStatus(status: "APPROVED" | "REJECTED" | "PENDING") {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/research/papers/${paper.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast({ title: `Paper ${status.toLowerCase()}` });
      router.refresh();
    } catch {
      toast({ title: "Could not update status", variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm(`Permanently delete "${paper.title}" and all its chunks?`))
      return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/research/papers/${paper.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast({ title: "Paper removed" });
      router.refresh();
    } catch {
      toast({ title: "Could not remove paper", variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  const statusTone =
    paper.status === "APPROVED"
      ? "bg-primary-500/15 text-primary-500 border-primary-500/30"
      : paper.status === "REJECTED"
        ? "bg-red-500/15 text-red-400 border-red-500/30"
        : "bg-neutral-200 text-neutral-700 border-neutral-300";

  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-100">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="font-medium text-neutral-900">{paper.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
            {paper.authors && <span className="truncate">{paper.authors}</span>}
            {paper.journal && <span>· {paper.journal}</span>}
            {paper.published_date && <span>· {paper.published_date}</span>}
            <span>
              · {chunks.length} chunk{chunks.length === 1 ? "" : "s"}
            </span>
            <span>
              · uploaded {format(new Date(paper.uploaded_at), "MMM d")}
            </span>
          </div>
          {paper.doi && (
            <p className="mt-1 font-mono text-xs text-neutral-400">
              DOI: {paper.doi}
            </p>
          )}
          <QualityBadge quality={quality} />
        </div>
        <span
          className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusTone}`}
        >
          {paper.status}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-neutral-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-neutral-400" />
        )}
      </button>

      {open && (
        <div className="border-t border-neutral-200 p-4 space-y-4">
          {paper.status === "PENDING" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => setStatus("APPROVED")}
                disabled={busy}
              >
                <Check className="h-4 w-4" /> Approve
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setStatus("REJECTED")}
                disabled={busy}
                className="text-red-400 border-red-500/30 hover:bg-red-500/10"
              >
                <X className="h-4 w-4" /> Reject
              </Button>
            </div>
          )}

          {paper.status === "APPROVED" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setStatus("PENDING")}
                disabled={busy}
              >
                Move back to pending
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={remove}
                disabled={busy}
                className="text-red-400 border-red-500/30 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" /> Remove
              </Button>
            </div>
          )}

          {paper.status === "REJECTED" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setStatus("PENDING")}
                disabled={busy}
              >
                Reconsider
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={remove}
                disabled={busy}
                className="text-red-400 border-red-500/30 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" /> Remove
              </Button>
            </div>
          )}

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Chunks ({chunks.length})
            </h4>
            <ol className="mt-2 space-y-2">
              {chunks.map((c) => (
                <li
                  key={c.id}
                  className="rounded-lg border border-neutral-200 bg-neutral-50/40 p-3"
                >
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <span className="font-mono">#{c.chunk_index + 1}</span>
                    {c.section_type && (
                      <span className="rounded-full bg-primary-500/10 px-2 py-0.5 text-primary-500">
                        {c.section_type}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm text-neutral-800">
                    {c.content}
                  </p>
                  {c.keywords.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {c.keywords.map((k) => (
                        <span
                          key={k}
                          className="rounded-full border border-neutral-300 px-2 py-0.5 font-mono text-xs text-neutral-600"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

function QualityBadge({ quality }: { quality?: PaperQualityScore }) {
  if (!quality || quality.total === 0) {
    return (
      <p className="mt-1 text-xs text-neutral-500">No feedback yet</p>
    );
  }
  const pct = quality.percentPositive ?? 0;
  const tone =
    pct < 50
      ? "text-red-400 border-red-500/40 bg-red-500/10"
      : pct < 75
        ? "text-secondary-700 border-secondary-500/40 bg-secondary-500/10"
        : "text-primary-500 border-primary-500/40 bg-primary-500/10";
  return (
    <p
      className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-xs ${tone}`}
    >
      Quality {pct}% · {quality.up}↑ {quality.down}↓
    </p>
  );
}
