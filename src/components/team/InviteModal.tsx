"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

export function InviteModal({
  open,
  onClose,
  childId,
  onInvited,
}: {
  open: boolean;
  onClose: () => void;
  childId: string;
  onInvited: () => void;
}) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"THERAPIST" | "FAMILY">("THERAPIST");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.includes("@")) {
      setError("Enter a valid email.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/children/${childId}/team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Could not send invite.");
      }
      setEmail("");
      toast({
        title: "Invite sent",
        description: `${email} can join after signing in.`,
      });
      onInvited();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send invite.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Invite a team member">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="invite-email">Email</Label>
          <Input
            id="invite-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="therapist@example.com"
          />
        </div>
        <div>
          <Label>Role</Label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: "THERAPIST", label: "Therapist", desc: "View + annotate" },
                { id: "FAMILY", label: "Family", desc: "View only" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setRole(opt.id)}
                className={`rounded-lg border p-3 text-left text-sm transition ${
                  role === opt.id
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-neutral-300 bg-white text-neutral-700"
                }`}
              >
                <div className="font-medium">{opt.label}</div>
                <div className="text-xs text-neutral-500">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>
        {error && <FieldError>{error}</FieldError>}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" block disabled={submitting}>
            {submitting ? "Sending…" : "Send invite"}
          </Button>
        </div>
        <p className="text-xs text-neutral-500">
          They'll get access once they sign in with this email.
        </p>
      </form>
    </Modal>
  );
}
