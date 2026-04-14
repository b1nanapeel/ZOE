"use client";

import Link from "next/link";
import { useState } from "react";
import { format } from "date-fns";
import {
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Quote,
  Check,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { SessionPrepSummary } from "@/lib/session-prep";

export function SessionPrepSummary({
  childName,
  summary,
}: {
  childName: string;
  summary: SessionPrepSummary;
}) {
  const [copied, setCopied] = useState(false);

  function asPlainText() {
    const lines: string[] = [
      `Session prep for ${childName}`,
      `${format(new Date(summary.period.from), "MMM d")} – ${format(
        new Date(summary.period.to),
        "MMM d",
      )}`,
      ``,
      `Total clips: ${summary.totalClips}`,
    ];
    if (summary.topBehaviors.length) {
      lines.push(`Top behaviors:`);
      summary.topBehaviors.forEach((b) =>
        lines.push(`  - ${b.behavior} (${b.count})`),
      );
    }
    if (summary.newBehaviors.length) {
      lines.push(`New behaviors this period: ${summary.newBehaviors.join(", ")}`);
    }
    if (summary.trends.length) {
      lines.push(`Trends:`);
      summary.trends.forEach((t) =>
        lines.push(
          `  - ${t.behavior}: ${t.direction} (${t.percentChange > 0 ? "+" : ""}${t.percentChange}%)`,
        ),
      );
    }
    if (summary.parentReflections.length) {
      lines.push(`Parent reflections:`);
      summary.parentReflections.forEach((r) => lines.push(`  - ${r.text}`));
    }
    return lines.join("\n");
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(asPlainText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <p className="text-xs uppercase tracking-wide text-neutral-500">
          Period
        </p>
        <p className="mt-1 text-sm text-neutral-800">
          {format(new Date(summary.period.from), "MMM d")} –{" "}
          {format(new Date(summary.period.to), "MMM d")}
        </p>
        <p className="mt-3 font-mono text-3xl font-semibold text-neutral-900">
          {summary.totalClips}
        </p>
        <p className="text-sm text-neutral-500">clips this period</p>
      </Card>

      <Section title="Top behaviors">
        {summary.topBehaviors.length === 0 ? (
          <Empty>Nothing tagged yet.</Empty>
        ) : (
          <ul className="space-y-1.5">
            {summary.topBehaviors.map((b) => (
              <li
                key={b.behavior}
                className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border border-neutral-100"
              >
                <span className="text-sm text-neutral-800">{b.behavior}</span>
                <span className="font-mono text-sm font-semibold text-neutral-900">
                  {b.count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {summary.newBehaviors.length > 0 && (
        <Section title="New this period">
          <div className="rounded-xl border border-primary-100 bg-primary-50/60 p-3">
            <div className="flex items-start gap-2 text-sm text-neutral-800">
              <Sparkles className="h-4 w-4 text-primary-600 mt-0.5" />
              <p>{summary.newBehaviors.join(", ")}</p>
            </div>
          </div>
        </Section>
      )}

      <Section title="Trend highlights">
        {summary.trends.length === 0 ? (
          <Empty>Need 5+ clips of a behavior to show a trend.</Empty>
        ) : (
          <ul className="space-y-1.5">
            {summary.trends.slice(0, 5).map((t) => {
              const Icon =
                t.direction === "increasing"
                  ? ArrowUpRight
                  : t.direction === "decreasing"
                    ? ArrowDownRight
                    : ArrowRight;
              const tone =
                t.direction === "increasing"
                  ? "text-emerald-600"
                  : t.direction === "decreasing"
                    ? "text-red-600"
                    : "text-neutral-500";
              return (
                <li
                  key={t.behavior}
                  className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border border-neutral-100"
                >
                  <span className="truncate text-sm text-neutral-800">
                    {t.behavior}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 font-mono text-sm font-medium ${tone}`}
                  >
                    <Icon className="h-4 w-4" />
                    {t.percentChange > 0 ? "+" : ""}
                    {t.percentChange}%
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {summary.parentReflections.length > 0 && (
        <Section title="Parent reflections">
          <ul className="space-y-2">
            {summary.parentReflections.map((r) => (
              <li
                key={r.clipId}
                className="rounded-lg border-l-4 border-primary-300 bg-primary-50/40 px-3 py-2"
              >
                <p className="flex items-center gap-1 text-xs text-primary-700">
                  <Quote className="h-3 w-3" />
                  {format(new Date(r.date), "MMM d")}
                </p>
                <p className="mt-1 text-sm text-neutral-800">{r.text}</p>
                <Link
                  href={`/clips/${r.clipId}`}
                  className="mt-1 inline-block text-xs font-medium text-primary-600 hover:underline"
                >
                  View clip →
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Active missions">
        {summary.activeMissions.length === 0 ? (
          <Empty>No active missions.</Empty>
        ) : (
          <ul className="space-y-1.5">
            {summary.activeMissions.map((m) => (
              <li
                key={m.id}
                className="rounded-lg bg-white px-3 py-2 border border-neutral-100 text-sm text-neutral-800"
              >
                {m.prompt}
              </li>
            ))}
          </ul>
        )}
        {summary.missionCompletions > 0 && (
          <p className="mt-2 text-xs text-neutral-500">
            {summary.missionCompletions} mission
            {summary.missionCompletions === 1 ? "" : "s"} completed this period.
          </p>
        )}
      </Section>

      <Button variant="secondary" block onClick={copy}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : "Copy summary"}
      </Button>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-neutral-500">{children}</p>;
}
