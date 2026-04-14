"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Target,
  Calendar,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export interface MissionData {
  id: string;
  prompt: string;
  status: "ACTIVE" | "COMPLETED" | "EXPIRED";
  due_date: string | null;
  assigned_by_name: string;
  created_at?: string;
  completed_at?: string | null;
}

export function MissionCard({
  mission,
  showRecordCta = false,
  canComplete = false,
  onChange,
}: {
  mission: MissionData;
  showRecordCta?: boolean;
  canComplete?: boolean;
  onChange?: () => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);

  async function complete() {
    setUpdating(true);
    try {
      const res = await fetch(`/api/missions/${mission.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      if (res.ok) {
        toast({ title: "Mission marked done" });
        onChange?.();
        router.refresh();
      } else {
        toast({ title: "Could not update mission", variant: "error" });
      }
    } finally {
      setUpdating(false);
    }
  }

  const StatusIcon =
    mission.status === "COMPLETED"
      ? CheckCircle2
      : mission.status === "EXPIRED"
        ? Clock
        : Target;
  const statusTone =
    mission.status === "COMPLETED"
      ? "text-emerald-600 bg-emerald-50"
      : mission.status === "EXPIRED"
        ? "text-neutral-500 bg-neutral-100"
        : "text-primary-700 bg-primary-50";

  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${statusTone}`}
        >
          <StatusIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-neutral-900">
            {mission.prompt}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
            <span>From {mission.assigned_by_name}</span>
            {mission.due_date && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Due {format(new Date(mission.due_date), "MMM d")}
              </span>
            )}
            <span className="font-medium text-neutral-600">
              {mission.status.toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      {(showRecordCta || canComplete) && mission.status === "ACTIVE" && (
        <div className="mt-3 flex gap-2">
          {showRecordCta && (
            <Link href="/clips/new" className="flex-1">
              <Button block size="sm">
                Record a clip for this
              </Button>
            </Link>
          )}
          {canComplete && (
            <Button
              variant="secondary"
              size="sm"
              onClick={complete}
              disabled={updating}
            >
              {updating ? "Saving…" : "Mark done"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
