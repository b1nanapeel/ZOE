"use client";

import { useMemo, useState } from "react";
import { startOfMonth, startOfWeek } from "date-fns";
import { BEHAVIOR_TAGS } from "@/lib/constants";
import { type QuickFilterId } from "@/lib/tag-helpers";
import { ClipList } from "./ClipList";
import { FilterBar } from "@/components/shared/FilterBar";
import {
  AdvancedFilters,
  EMPTY_ADVANCED,
  type AdvancedFilterValues,
} from "@/components/shared/AdvancedFilters";
import type { ClipCardData } from "./ClipCard";

const COMMUNICATION = new Set(BEHAVIOR_TAGS.Communication as readonly string[]);
const MOVEMENT = new Set(BEHAVIOR_TAGS.Movement as readonly string[]);
const EMOTIONAL = new Set(BEHAVIOR_TAGS.Emotional as readonly string[]);
const SENSORY = new Set(BEHAVIOR_TAGS.Sensory as readonly string[]);

interface TimelineClip extends ClipCardData {
  mood_before: string | null;
}

export function TimelineView({ clips }: { clips: TimelineClip[] }) {
  const [quick, setQuick] = useState<QuickFilterId>("all");
  const [advanced, setAdvanced] = useState<AdvancedFilterValues>(EMPTY_ADVANCED);

  const filtered = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const monthStart = startOfMonth(new Date());
    const start = advanced.startDate ? new Date(advanced.startDate) : null;
    const end = advanced.endDate ? new Date(advanced.endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);

    return clips.filter((c) => {
      const at = new Date(c.uploaded_at);

      if (quick === "this-week" && at < weekStart) return false;
      if (quick === "this-month" && at < monthStart) return false;
      if (
        quick === "communication" &&
        !c.behaviors.some((b) => COMMUNICATION.has(b))
      )
        return false;
      if (quick === "movement" && !c.behaviors.some((b) => MOVEMENT.has(b)))
        return false;
      if (quick === "emotional" && !c.behaviors.some((b) => EMOTIONAL.has(b)))
        return false;
      if (quick === "sensory" && !c.behaviors.some((b) => SENSORY.has(b)))
        return false;

      if (start && at < start) return false;
      if (end && at > end) return false;
      if (advanced.location && c.location !== advanced.location) return false;
      if (advanced.mood && c.mood_before !== advanced.mood) return false;

      return true;
    });
  }, [clips, quick, advanced]);

  return (
    <div className="space-y-4">
      <FilterBar active={quick} onChange={setQuick} />
      <AdvancedFilters values={advanced} onChange={setAdvanced} />
      <ClipList clips={filtered} />
    </div>
  );
}
