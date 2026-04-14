"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { LOCATION_TAGS, MOOD_TAGS } from "@/lib/constants";
import { TagChip } from "@/components/tagging/TagChip";

export interface AdvancedFilterValues {
  startDate: string;
  endDate: string;
  location: string;
  mood: string;
}

export const EMPTY_ADVANCED: AdvancedFilterValues = {
  startDate: "",
  endDate: "",
  location: "",
  mood: "",
};

export function AdvancedFilters({
  values,
  onChange,
}: {
  values: AdvancedFilterValues;
  onChange: (v: AdvancedFilterValues) => void;
}) {
  const [open, setOpen] = useState(false);
  const activeCount =
    (values.startDate ? 1 : 0) +
    (values.endDate ? 1 : 0) +
    (values.location ? 1 : 0) +
    (values.mood ? 1 : 0);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-neutral-700"
      >
        <span>
          Advanced filters
          {activeCount > 0 && (
            <span className="ml-2 rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-700">
              {activeCount}
            </span>
          )}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {open && (
        <div className="space-y-4 border-t border-neutral-100 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-600">
                From
              </label>
              <input
                type="date"
                value={values.startDate}
                onChange={(e) =>
                  onChange({ ...values, startDate: e.target.value })
                }
                className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-600">
                To
              </label>
              <input
                type="date"
                value={values.endDate}
                onChange={(e) =>
                  onChange({ ...values, endDate: e.target.value })
                }
                className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-neutral-600">
              Location
            </p>
            <div className="flex flex-wrap gap-2">
              {LOCATION_TAGS.map((t) => (
                <TagChip
                  key={t}
                  label={t}
                  selected={values.location === t}
                  onClick={() =>
                    onChange({
                      ...values,
                      location: values.location === t ? "" : t,
                    })
                  }
                  size="sm"
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-neutral-600">Mood</p>
            <div className="flex flex-wrap gap-2">
              {MOOD_TAGS.map((t) => (
                <TagChip
                  key={t}
                  label={t}
                  selected={values.mood === t}
                  onClick={() =>
                    onChange({ ...values, mood: values.mood === t ? "" : t })
                  }
                  size="sm"
                />
              ))}
            </div>
          </div>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => onChange(EMPTY_ADVANCED)}
              className="text-sm font-medium text-primary-600 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
