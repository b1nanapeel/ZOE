"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "library", label: "Library" },
  { id: "feedback", label: "Feedback" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export function AdminTabs({
  library,
  feedback,
}: {
  library: React.ReactNode;
  feedback: React.ReactNode;
}) {
  const [tab, setTab] = useState<TabId>("library");
  return (
    <div className="space-y-5">
      <div className="-mx-6 overflow-x-auto px-6">
        <div className="flex gap-1 border-b border-neutral-200">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "shrink-0 -mb-px border-b-2 px-3 py-2 text-sm font-medium transition",
                tab === t.id
                  ? "border-primary-500 text-primary-500"
                  : "border-transparent text-neutral-500 hover:text-neutral-700",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {tab === "library" ? library : feedback}
    </div>
  );
}
