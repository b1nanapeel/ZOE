"use client";

import { useState } from "react";
import { Trash2, Mail, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/toast";

export interface CareTeamMemberRow {
  id: string;
  email: string;
  role: "THERAPIST" | "FAMILY";
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  invited_at: string;
  joined_at: string | null;
}

export function MemberList({
  members,
  childId,
  onChange,
}: {
  members: CareTeamMemberRow[];
  childId: string;
  onChange: () => void;
}) {
  const { toast } = useToast();
  const [removing, setRemoving] = useState<string | null>(null);

  if (members.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-200 bg-white px-6 py-10 text-center">
        <p className="text-sm font-medium text-neutral-700">
          No one's on the care team yet.
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          Invite your child's therapist to see clips and add their insights.
        </p>
      </div>
    );
  }

  async function remove(memberId: string) {
    if (!confirm("Remove this team member?")) return;
    setRemoving(memberId);
    try {
      const res = await fetch(`/api/children/${childId}/team/${memberId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast({ title: "Member removed" });
      onChange();
    } catch {
      toast({ title: "Could not remove member", variant: "error" });
    } finally {
      setRemoving(null);
    }
  }

  return (
    <ul className="space-y-2">
      {members.map((m) => (
        <li
          key={m.id}
          className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white p-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
            <Mail className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-900">
              {m.email}
            </p>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-500">
              <span className="font-medium text-neutral-700">
                {m.role === "THERAPIST" ? "Therapist" : "Family"}
              </span>
              <span>·</span>
              {m.status === "ACCEPTED" ? (
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" />
                  Active{m.joined_at && ` since ${format(new Date(m.joined_at), "MMM d")}`}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-600">
                  <Clock className="h-3 w-3" />
                  Pending
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => remove(m.id)}
            disabled={removing === m.id}
            aria-label="Remove member"
            className="rounded-md p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}
