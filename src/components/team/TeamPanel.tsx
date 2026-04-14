"use client";

import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InviteModal } from "./InviteModal";
import { MemberList, type CareTeamMemberRow } from "./MemberList";

export function TeamPanel({
  childId,
  initialMembers,
}: {
  childId: string;
  initialMembers: CareTeamMemberRow[];
}) {
  const [members, setMembers] = useState(initialMembers);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch(`/api/children/${childId}/team`);
      if (res.ok) {
        const body = (await res.json()) as { members: CareTeamMemberRow[] };
        setMembers(body.members);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-600">
          {members.length === 0
            ? "No members yet."
            : `${members.length} member${members.length === 1 ? "" : "s"}`}
        </p>
        <Button size="sm" onClick={() => setOpen(true)}>
          <UserPlus className="h-4 w-4" /> Invite
        </Button>
      </div>
      <MemberList members={members} childId={childId} onChange={refresh} />
      <InviteModal
        open={open}
        onClose={() => setOpen(false)}
        childId={childId}
        onInvited={refresh}
      />
      {loading && (
        <p className="text-xs text-neutral-400">Refreshing…</p>
      )}
    </div>
  );
}
