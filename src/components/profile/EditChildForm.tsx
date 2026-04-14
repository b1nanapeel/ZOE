"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";
import { useToast } from "@/components/ui/toast";
import {
  COMMUNICATION_LEVELS,
  DIAGNOSIS_STATUSES,
  THERAPY_OPTIONS,
} from "@/lib/constants";

interface ChildValues {
  name: string;
  dateOfBirth: string;
  communicationLevel: (typeof COMMUNICATION_LEVELS)[number]["value"];
  diagnosisStatus: (typeof DIAGNOSIS_STATUSES)[number]["value"];
  currentTherapies: string[];
  notes: string;
}

export function EditChildForm({
  childId,
  initial,
}: {
  childId: string;
  initial: ChildValues;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [v, setV] = useState(initial);
  const [saving, setSaving] = useState(false);

  function toggleTherapy(t: string) {
    setV((curr) => ({
      ...curr,
      currentTherapies: curr.currentTherapies.includes(t)
        ? curr.currentTherapies.filter((x) => x !== t)
        : [...curr.currentTherapies, t],
    }));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/children/${childId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Could not save.");
      }
      toast({ title: "Profile updated" });
      router.push("/profile");
      router.refresh();
    } catch (e) {
      toast({
        title: "Could not save",
        description: e instanceof Error ? e.message : undefined,
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="child-name">First name</Label>
        <Input
          id="child-name"
          value={v.name}
          onChange={(e) => setV({ ...v, name: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="child-dob">Date of birth</Label>
        <Input
          id="child-dob"
          type="date"
          value={v.dateOfBirth}
          onChange={(e) => setV({ ...v, dateOfBirth: e.target.value })}
        />
      </div>
      <div>
        <Label>Communication level</Label>
        <div className="flex flex-wrap gap-2">
          {COMMUNICATION_LEVELS.map((opt) => (
            <Chip
              key={opt.value}
              selected={v.communicationLevel === opt.value}
              onClick={() => setV({ ...v, communicationLevel: opt.value })}
            >
              {opt.label}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <Label>Diagnosis status</Label>
        <div className="flex flex-wrap gap-2">
          {DIAGNOSIS_STATUSES.map((opt) => (
            <Chip
              key={opt.value}
              selected={v.diagnosisStatus === opt.value}
              onClick={() => setV({ ...v, diagnosisStatus: opt.value })}
            >
              {opt.label}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <Label>Current therapies</Label>
        <div className="flex flex-wrap gap-2">
          {THERAPY_OPTIONS.map((t) => (
            <Chip
              key={t}
              selected={v.currentTherapies.includes(t)}
              onClick={() => toggleTherapy(t)}
            >
              {t}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="child-notes">Notes</Label>
        <textarea
          id="child-notes"
          rows={3}
          value={v.notes}
          onChange={(e) => setV({ ...v, notes: e.target.value })}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 focus:outline-none"
          placeholder="Anything you want to remember…"
        />
      </div>
      <div className="flex gap-2 pt-2">
        <Button
          variant="secondary"
          onClick={() => router.back()}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button block onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
