"use client";

import { StepShell } from "./StepShell";

export interface ReflectionValues {
  parentInterpretation: string;
  parentFeeling: string;
}

export function ReflectionStep({
  values,
  onChange,
  onSave,
  onBack,
  onSkip,
  saving,
  stepIndex,
  totalSteps,
}: {
  values: ReflectionValues;
  onChange: (v: ReflectionValues) => void;
  onSave: () => void;
  onBack: () => void;
  onSkip: () => void;
  saving?: boolean;
  stepIndex: number;
  totalSteps: number;
}) {
  return (
    <StepShell
      title="Your reflection"
      question="A note to yourself (optional)"
      onBack={onBack}
      onNext={onSave}
      onSkip={onSkip}
      nextLabel="Save clip"
      saving={saving}
      stepIndex={stepIndex}
      totalSteps={totalSteps}
    >
      <div className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            What do you think was happening?
          </label>
          <textarea
            value={values.parentInterpretation}
            onChange={(e) =>
              onChange({ ...values, parentInterpretation: e.target.value })
            }
            rows={3}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 focus:outline-none"
            placeholder="A guess, a hunch, a question…"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            How did this make you feel?
          </label>
          <textarea
            value={values.parentFeeling}
            onChange={(e) =>
              onChange({ ...values, parentFeeling: e.target.value })
            }
            rows={3}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 focus:outline-none"
            placeholder="Confused, proud, exhausted, hopeful…"
          />
        </div>
      </div>
    </StepShell>
  );
}
