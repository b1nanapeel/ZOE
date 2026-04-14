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
    selected: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/40",
    unselected: "bg-neutral-100 text-neutral-600 hover:bg-emerald-50",
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
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  category?: TagCategoryColor;
  size?: "md" | "sm";
}) {
  const style = STYLES[category];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-full font-medium transition-all",
        size === "md" ? "h-8 px-3 text-sm" : "h-6 px-2 text-xs",
        selected ? style.selected : style.unselected,
      )}
    >
      {label}
    </button>
  );
}
