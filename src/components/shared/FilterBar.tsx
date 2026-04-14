"use client";

import { QUICK_FILTERS, type QuickFilterId } from "@/lib/tag-helpers";
import { cn } from "@/lib/utils";

export function FilterBar({
  active,
  onChange,
}: {
  active: QuickFilterId;
  onChange: (id: QuickFilterId) => void;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <div className="flex gap-2 pb-1">
        {QUICK_FILTERS.map((f) => {
          const isActive = f.id === active;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onChange(f.id)}
              className={cn(
                "h-8 shrink-0 rounded-full px-3 text-sm font-medium transition",
                isActive
                  ? "bg-primary-500 text-white"
                  : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50",
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
