"use client";

import { Button } from "@/components/ui/button";

export function StepShell({
  title,
  question,
  children,
  onBack,
  onNext,
  onSkip,
  nextLabel = "Next",
  nextDisabled,
  saving,
  stepIndex,
  totalSteps,
}: {
  title?: string;
  question: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  saving?: boolean;
  stepIndex: number;
  totalSteps: number;
}) {
  return (
    <div className="flex flex-col min-h-[calc(100dvh-4rem)]">
      <div className="mb-6">
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i <= stepIndex ? "bg-primary-500" : "bg-neutral-200"
              }`}
            />
          ))}
        </div>
        {title && (
          <p className="mt-3 text-xs uppercase tracking-wide text-neutral-500">
            {title}
          </p>
        )}
        <h1 className="mt-1 text-xl font-semibold text-neutral-900">
          {question}
        </h1>
      </div>

      <div className="flex-1">{children}</div>

      <div className="sticky bottom-0 -mx-4 mt-8 flex gap-2 bg-neutral-50 px-4 py-4">
        {onBack && (
          <Button variant="secondary" onClick={onBack} disabled={saving}>
            Back
          </Button>
        )}
        {onSkip && (
          <Button variant="ghost" onClick={onSkip} disabled={saving}>
            Skip
          </Button>
        )}
        <Button
          block
          onClick={onNext}
          disabled={nextDisabled || saving}
        >
          {saving ? "Saving…" : nextLabel}
        </Button>
      </div>
    </div>
  );
}

export function ChipGrid({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

export function NoteField({
  value,
  onChange,
  placeholder = "Add more detail…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className="mt-4 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 focus:outline-none"
    />
  );
}
