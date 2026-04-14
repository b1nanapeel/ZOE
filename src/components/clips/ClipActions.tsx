"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function ClipActions({ clipId }: { clipId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  async function softDelete() {
    setBusy(true);
    try {
      const res = await fetch(`/api/clips/${clipId}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Could not delete.");
      }
      toast({
        title: "Clip deleted",
        description: "It will be permanently removed in 30 days.",
        action: {
          label: "Undo",
          onClick: async () => {
            await fetch(`/api/clips/${clipId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ isDeleted: false }),
            });
            router.push(`/clips/${clipId}`);
            router.refresh();
          },
        },
        duration: 8000,
      });
      router.push("/timeline");
      router.refresh();
    } catch (e) {
      toast({
        title: "Could not delete",
        description: e instanceof Error ? e.message : undefined,
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Link href={`/clips/${clipId}/edit`} className="flex-1">
        <Button variant="secondary" block size="sm">
          <Pencil className="h-4 w-4" /> Edit tags
        </Button>
      </Link>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          if (confirm("Delete this clip? You can undo within 30 days.")) {
            softDelete();
          }
        }}
        disabled={busy}
        className="text-red-600 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
