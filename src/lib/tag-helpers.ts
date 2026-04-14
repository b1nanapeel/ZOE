import { BEHAVIOR_TAGS } from "./constants";
import type { TagCategoryColor } from "@/components/tagging/TagChip";

const BEHAVIOR_COLOR: Record<string, TagCategoryColor> = {};
(Object.keys(BEHAVIOR_TAGS) as Array<keyof typeof BEHAVIOR_TAGS>).forEach(
  (group) => {
    const color: TagCategoryColor =
      group === "Communication"
        ? "communication"
        : group === "Movement"
          ? "movement"
          : group === "Emotional"
            ? "emotional"
            : "sensory";
    BEHAVIOR_TAGS[group].forEach((tag) => {
      BEHAVIOR_COLOR[tag] = color;
    });
  },
);

export function behaviorColor(tag: string): TagCategoryColor {
  return BEHAVIOR_COLOR[tag] ?? "neutral";
}

export const QUICK_FILTERS = [
  { id: "all", label: "All" },
  { id: "communication", label: "Communication", category: "communication" },
  { id: "movement", label: "Movement", category: "movement" },
  { id: "emotional", label: "Emotional", category: "emotional" },
  { id: "sensory", label: "Sensory", category: "sensory" },
  { id: "this-week", label: "This week" },
  { id: "this-month", label: "This month" },
] as const;

export type QuickFilterId = (typeof QUICK_FILTERS)[number]["id"];
