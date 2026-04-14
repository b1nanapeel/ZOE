"use client";

import { ANTECEDENT_TAGS } from "@/lib/constants";
import { ChipGrid, NoteField, StepShell } from "./StepShell";
import { TagChip } from "./TagChip";

export function AntecedentStep({
  selected,
  note,
  onChange,
  onNext,
  onBack,
  stepIndex,
  totalSteps,
}: {
  selected: string[];
  note: string;
  onChange: (next: { selected: string[]; note: string }) => void;
  onNext: () => void;
  onBack: () => void;
  stepIndex: number;
  totalSteps: number;
}) {
  function toggle(tag: string) {
    onChange({
      selected: selected.includes(tag)
        ? selected.filter((t) => t !== tag)
        : [...selected, tag],
      note,
    });
  }

  return (
    <StepShell
      title="Antecedent"
      question="What was happening right before this?"
      onBack={onBack}
      onNext={onNext}
      stepIndex={stepIndex}
      totalSteps={totalSteps}
    >
      <ChipGrid>
        {ANTECEDENT_TAGS.map((t) => (
          <TagChip
            key={t}
            label={t}
            selected={selected.includes(t)}
            onClick={() => toggle(t)}
            category="antecedent"
          />
        ))}
      </ChipGrid>
      <NoteField value={note} onChange={(v) => onChange({ selected, note: v })} />
    </StepShell>
  );
}
