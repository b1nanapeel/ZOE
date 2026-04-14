"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

export function CreateMission({ childId }: { childId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Add a prompt.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/children/${childId}/missions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, dueDate: dueDate || null }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Could not create mission.");
      }
      setPrompt("");
      setDueDate("");
      setOpen(false);
      toast({ title: "Mission created" });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create mission.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> New mission
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create observation mission"
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="mission-prompt">What should the parent watch for?</Label>
            <textarea
              id="mission-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="e.g. Try to capture a clip during morning transition."
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 focus:outline-none"
            />
          </div>
          <div>
            <Label htmlFor="mission-due">Due date (optional)</Label>
            <Input
              id="mission-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          {error && <FieldError>{error}</FieldError>}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" block disabled={saving}>
              {saving ? "Creating…" : "Create mission"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
