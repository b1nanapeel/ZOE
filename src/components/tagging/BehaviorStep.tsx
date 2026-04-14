"use client";

import { BEHAVIOR_TAGS } from "@/lib/constants";
import { ChipGrid, NoteField, StepShell } from "./StepShell";
import { TagChip, type TagCategoryColor } from "./TagChip";

const CATEGORY_COLORS: Record<keyof typeof BEHAVIOR_TAGS, TagCategoryColor> = {
  Communication: "communication",
  Movement: "movement",
  Emotional: "emotional",
  Sensory: "sensory",
};

export function BehaviorStep({
  childName,
  selected,
  note,
  onChange,
  onNext,
  onBack,
  stepIndex,
  totalSteps,
}: {
  childName: string;
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
      title="Behavior"
      question={`What did ${childName} do?`}
      onBack={onBack}
      onNext={onNext}
      stepIndex={stepIndex}
      totalSteps={totalSteps}
    >
      <div className="space-y-5">
        {(Object.keys(BEHAVIOR_TAGS) as Array<keyof typeof BEHAVIOR_TAGS>).map(
          (group) => (
            <div key={group}>
              <h3 className="mb-2 text-sm font-medium text-neutral-500">
                {group}
              </h3>
              <ChipGrid>
                {BEHAVIOR_TAGS[group].map((t) => (
                  <TagChip
                    key={t}
                    label={t}
                    selected={selected.includes(t)}
                    onClick={() => toggle(t)}
                    category={CATEGORY_COLORS[group]}
                  />
                ))}
              </ChipGrid>
            </div>
          ),
        )}
      </div>
      <NoteField value={note} onChange={(v) => onChange({ selected, note: v })} />
    </StepShell>
  );
}
