"use client";

import {
  LOCATION_TAGS,
  MOOD_TAGS,
  PEOPLE_PRESENT_TAGS,
  TIME_CONTEXT_TAGS,
} from "@/lib/constants";
import { ChipGrid, StepShell } from "./StepShell";
import { TagChip } from "./TagChip";

export interface ContextValues {
  location: string;
  timeContext: string;
  peoplePresent: string[];
  moodBefore: string;
}

export function ContextStep({
  values,
  onChange,
  onNext,
  onBack,
  onSkip,
  stepIndex,
  totalSteps,
}: {
  values: ContextValues;
  onChange: (v: ContextValues) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  stepIndex: number;
  totalSteps: number;
}) {
  function togglePerson(tag: string) {
    onChange({
      ...values,
      peoplePresent: values.peoplePresent.includes(tag)
        ? values.peoplePresent.filter((p) => p !== tag)
        : [...values.peoplePresent, tag],
    });
  }

  return (
    <StepShell
      title="Context"
      question="A bit more context (optional)"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      stepIndex={stepIndex}
      totalSteps={totalSteps}
    >
      <div className="space-y-5">
        <div>
          <h3 className="mb-2 text-sm font-medium text-neutral-500">Where</h3>
          <ChipGrid>
            {LOCATION_TAGS.map((t) => (
              <TagChip
                key={t}
                label={t}
                selected={values.location === t}
                onClick={() =>
                  onChange({ ...values, location: values.location === t ? "" : t })
                }
              />
            ))}
          </ChipGrid>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-medium text-neutral-500">When</h3>
          <ChipGrid>
            {TIME_CONTEXT_TAGS.map((t) => (
              <TagChip
                key={t}
                label={t}
                selected={values.timeContext === t}
                onClick={() =>
                  onChange({
                    ...values,
                    timeContext: values.timeContext === t ? "" : t,
                  })
                }
              />
            ))}
          </ChipGrid>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-medium text-neutral-500">
            Who was there
          </h3>
          <ChipGrid>
            {PEOPLE_PRESENT_TAGS.map((t) => (
              <TagChip
                key={t}
                label={t}
                selected={values.peoplePresent.includes(t)}
                onClick={() => togglePerson(t)}
              />
            ))}
          </ChipGrid>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-medium text-neutral-500">
            Mood before
          </h3>
          <ChipGrid>
            {MOOD_TAGS.map((t) => (
              <TagChip
                key={t}
                label={t}
                selected={values.moodBefore === t}
                onClick={() =>
                  onChange({
                    ...values,
                    moodBefore: values.moodBefore === t ? "" : t,
                  })
                }
              />
            ))}
          </ChipGrid>
        </div>
      </div>
    </StepShell>
  );
}
