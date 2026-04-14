"use client";

import { cn } from "@/lib/utils";

export type TagCategoryColor =
  | "antecedent"
  | "communication"
  | "movement"
  | "emotional"
  | "sensory"
  | "consequence"
  | "neutral";

const STYLES: Record<TagCategoryColor, { selected: string; unselected: string }> = {
  antecedent: {
    selected: "bg-neutral-200 text-neutral-800 ring-1 ring-neutral-400/50",
    unselected: "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
  },
  communication: {
    selected: "bg-blue-50 text-blue-700 ring-1 ring-blue-500/40",
    unselected: "bg-neutral-100 text-neutral-600 hover:bg-blue-50",
  },
  movement: {
    selected: "bg-amber-50 text-amber-700 ring-1 ring-amber-500/40",
    unselected: "bg-neutral-100 text-neutral-600 hover:bg-amber-50",
  },
  emotional: {
    selected: "bg-pink-50 text-pink-700 ring-1 ring-pink-500/40",
    unselected: "bg-neutral-100 text-neutral-600 hover:bg-pink-50",
  },
  sensory: {
    selected: "bg-violet-50 text-violet-700 ring-1 ring-violet-500/40",
    unselected: "bg-neutral-100 text-neutral-600 hover:bg-violet-50",
  },
  consequence: {
    selected: "bg-secondary-50 text-secondary-700 ring-1 ring-secondary-500/40",
    unselected: "bg-neutral-100 text-neutral-600 hover:bg-secondary-50",
  },
  neutral: {
    selected: "bg-primary-100 text-primary-700 ring-1 ring-primary-500/40",
    unselected: "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
  },
};

export function TagChip({
  label,
  selected,
  onClick,
  category = "neutral",
  size = "md",
  aiSuggested = false,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  category?: TagCategoryColor;
  size?: "md" | "sm";
  aiSuggested?: boolean;
}) {
  const style = STYLES[category];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      title={aiSuggested ? "AI suggested — tap to keep or remove" : undefined}
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium transition-all",
        size === "md" ? "h-8 px-3 text-sm" : "h-6 px-2 text-xs",
        selected ? style.selected : style.unselected,
        aiSuggested && selected && "ring-1 ring-primary-500/60",
      )}
    >
      {aiSuggested && (
        <span
          aria-hidden
          className="text-[10px] leading-none text-primary-500"
        >
          ✦
        </span>
      )}
      {label}
    </button>
  );
}
