import { Lightbulb } from "lucide-react";
import {
  INTELLIGENCE_DISCLAIMER,
  type IntelligenceReport,
} from "@/lib/pattern-intelligence";

interface Props {
  report: IntelligenceReport;
}

export function InsightsSection({ report }: Props) {
  if (!report.hasEnoughData) {
    return (
      <section>
        <Header />
        <p className="text-sm text-neutral-500">
          Once you have 5 or more tagged clips, ZOE will start surfacing
          patterns here.
        </p>
        <Disclaimer />
      </section>
    );
  }

  const sections: Array<{ title: string; paragraphs: string[] }> = [];

  if (report.progress) {
    sections.push({ title: "Progress", paragraphs: [report.progress.paragraph] });
  }
  if (report.trends.length > 0) {
    sections.push({
      title: "Trends",
      paragraphs: report.trends.slice(0, 5).map((t) => t.paragraph),
    });
  }
  if (report.triggers.length > 0) {
    sections.push({
      title: "Triggers",
      paragraphs: report.triggers.slice(0, 5).map((t) => t.paragraph),
    });
  }
  if (report.timePatterns.length > 0) {
    sections.push({
      title: "Time patterns",
      paragraphs: report.timePatterns.slice(0, 5).map((t) => t.paragraph),
    });
  }
  if (report.contextCorrelations.length > 0) {
    sections.push({
      title: "Context",
      paragraphs: report.contextCorrelations.slice(0, 5).map((c) => c.paragraph),
    });
  }
  if (report.audio) {
    sections.push({
      title: "Vocalization",
      paragraphs: [report.audio.paragraph],
    });
  }
  if (report.movement) {
    sections.push({
      title: "Movement",
      paragraphs: [report.movement.paragraph],
    });
  }

  return (
    <section>
      <Header />
      {sections.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Not enough recurring patterns yet. Keep tagging — patterns surface
          once behaviors repeat 3+ times with consistent context.
        </p>
      ) : (
        <div className="space-y-5">
          {sections.map((s) => (
            <div key={s.title}>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {s.title}
              </h4>
              <ul className="space-y-2">
                {s.paragraphs.map((p, idx) => (
                  <li
                    key={idx}
                    className="rounded-lg border border-l-4 border-l-primary-500 border-neutral-200 bg-neutral-100 p-3 text-sm text-neutral-800"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      <Disclaimer />
    </section>
  );
}

function Header() {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Lightbulb className="h-4 w-4 text-primary-500" />
      <h3 className="text-base font-semibold text-neutral-900">
        ZOE's observations
      </h3>
    </div>
  );
}

function Disclaimer() {
  return (
    <p className="mt-4 text-xs italic text-neutral-500">
      {INTELLIGENCE_DISCLAIMER}
    </p>
  );
}

export function TherapistSummaryBlock({
  paragraphs,
}: {
  paragraphs: string[];
}) {
  if (paragraphs.length === 0) return null;
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Therapist-ready summary
      </h3>
      <article className="rounded-xl border border-l-4 border-l-primary-500 border-neutral-200 bg-neutral-100 p-4">
        <ul className="space-y-2 text-sm leading-relaxed text-neutral-800">
          {paragraphs.map((p, idx) => (
            <li key={idx}>· {p}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs italic text-neutral-500">
          {INTELLIGENCE_DISCLAIMER}
        </p>
      </article>
    </section>
  );
}
