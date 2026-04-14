import { Eye } from "lucide-react";

export function AiObservationCard({
  observation,
  confidence,
}: {
  observation: string;
  confidence: number | null;
}) {
  const pct =
    typeof confidence === "number"
      ? Math.round(Math.max(0, Math.min(1, confidence)) * 100)
      : null;
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        ZOE observed
      </h3>
      <article className="rounded-xl border border-l-4 border-l-primary-500 border-neutral-200 bg-neutral-100 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-500/15 text-primary-500">
            <Eye className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-relaxed text-neutral-800">
              {observation}
            </p>
            {pct !== null && (
              <p className="mt-2 font-mono text-xs text-neutral-500">
                AI confidence: {pct}%
              </p>
            )}
            <p className="mt-2 text-xs text-neutral-500">
              ZOE's observation, separate from your own. Not a clinical opinion.
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}
