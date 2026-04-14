"use client";

import { cn } from "@/lib/utils";

export function Chip({
  selected,
  onClick,
  children,
  className,
}: {
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 rounded-full px-3 text-sm font-medium transition-all",
        selected
          ? "bg-primary-100 text-primary-700 ring-1 ring-primary-500/40"
          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
        className,
      )}
    >
      {children}
    </button>
  );
}
