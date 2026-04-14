"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center">
      <AlertCircle className="mx-auto h-6 w-6 text-red-500" />
      <h2 className="mt-3 text-base font-semibold text-neutral-900">
        Couldn't load this view.
      </h2>
      <p className="mt-1 text-sm text-neutral-600">
        Likely a network hiccup. Try again.
      </p>
      <Button className="mt-4" size="sm" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
