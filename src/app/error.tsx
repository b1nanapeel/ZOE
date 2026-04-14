"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-6 text-center">
      <h1 className="text-2xl font-semibold text-neutral-900">
        Something went sideways.
      </h1>
      <p className="mt-2 max-w-sm text-sm text-neutral-600">
        We hit an error loading this view. Try again, or head back home.
      </p>
      <div className="mt-6 flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="secondary" onClick={() => (window.location.href = "/")}>
          Home
        </Button>
      </div>
    </div>
  );
}
