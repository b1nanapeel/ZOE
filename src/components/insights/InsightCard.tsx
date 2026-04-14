import { Lightbulb } from "lucide-react";
import type { HighlightInsight } from "@/lib/pattern-intelligence";

export function InsightCard({ insight }: { insight: HighlightInsight }) {
  return (
    <article className="rounded-xl border border-l-4 border-l-primary-500 border-neutral-200 bg-neutral-100 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-500/15 text-primary-500">
          <Lightbulb className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-500">
            {insight.title}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-neutral-800">
            {insight.paragraph}
          </p>
        </div>
      </div>
    </article>
  );
}
