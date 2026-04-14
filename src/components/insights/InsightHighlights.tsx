import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { HighlightInsight } from "@/lib/pattern-intelligence";
import { InsightCard } from "./InsightCard";

export function InsightHighlights({
  insights,
}: {
  insights: HighlightInsight[];
}) {
  if (insights.length === 0) return null;
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          What ZOE noticed
        </h3>
        <Link
          href="/patterns"
          className="inline-flex items-center text-xs font-medium text-primary-500 hover:text-primary-400"
        >
          All patterns <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <ul className="space-y-2">
        {insights.map((i) => (
          <li key={i.id}>
            <InsightCard insight={i} />
          </li>
        ))}
      </ul>
    </section>
  );
}
