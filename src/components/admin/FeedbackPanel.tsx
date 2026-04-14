import { format } from "date-fns";
import { ThumbsDown, ThumbsUp, AlertTriangle } from "lucide-react";
import type { FeedbackOverview } from "@/lib/research-admin";

export function FeedbackPanel({ data }: { data: FeedbackOverview }) {
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Insights shown" value={data.totalInsights.toString()} />
        <Stat
          label="Thumbs up"
          value={data.upCount.toString()}
          tone="positive"
        />
        <Stat
          label="Thumbs down"
          value={data.downCount.toString()}
          tone="negative"
        />
        <Stat
          label="% positive"
          value={
            data.percentPositive === null
              ? "—"
              : `${data.percentPositive}%`
          }
          tone={
            data.percentPositive === null
              ? undefined
              : data.percentPositive >= 50
                ? "positive"
                : "negative"
          }
        />
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Most flagged papers
        </h3>
        {data.mostFlaggedPapers.length === 0 ? (
          <p className="text-sm text-neutral-500">No papers flagged yet.</p>
        ) : (
          <ul className="space-y-2">
            {data.mostFlaggedPapers.map((p) => (
              <li
                key={p.paperId}
                className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-100 p-3"
              >
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="min-w-0 flex-1 truncate text-sm text-neutral-800">
                  {p.title}
                </span>
                <span className="font-mono text-xs text-red-400">
                  {p.flagCount} flag{p.flagCount === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Recent thumbs-down feedback
        </h3>
        {data.recentDownvotes.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No thumbs-down feedback yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {data.recentDownvotes.map((f) => (
              <li
                key={f.id}
                className="rounded-xl border border-neutral-200 bg-neutral-100 p-4"
              >
                <div className="flex items-start gap-2 text-xs text-neutral-500">
                  <ThumbsDown className="h-3.5 w-3.5 text-red-400" />
                  <span>
                    {format(new Date(f.created_at), "MMM d, h:mm a")}
                  </span>
                  {f.behavioral_context && (
                    <span className="rounded-full bg-neutral-200 px-2 py-0.5 font-mono text-neutral-600">
                      {f.behavioral_context}
                    </span>
                  )}
                </div>

                {f.paper_title && (
                  <p className="mt-1.5 text-sm font-medium text-neutral-800">
                    {f.paper_title}
                  </p>
                )}

                {f.insight_text && (
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-700">
                    {f.insight_text}
                  </p>
                )}

                {f.feedback_note && (
                  <div className="mt-2 rounded-lg border-l-2 border-l-red-400 bg-neutral-50/40 p-2">
                    <p className="text-xs text-neutral-500">User said</p>
                    <p className="mt-0.5 text-sm text-neutral-800">
                      {f.feedback_note}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
}) {
  const toneCls =
    tone === "positive"
      ? "text-primary-500"
      : tone === "negative"
        ? "text-red-400"
        : "text-neutral-900";
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-100 p-4">
      <p className="text-xs uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      <p className={`mt-1 font-mono text-xl font-semibold ${toneCls}`}>
        {value}
      </p>
    </div>
  );
}
