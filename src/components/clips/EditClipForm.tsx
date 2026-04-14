"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TagChip, type TagCategoryColor } from "@/components/tagging/TagChip";
import {
  ANTECEDENT_TAGS,
  BEHAVIOR_TAGS,
  CONSEQUENCE_TAGS,
  LOCATION_TAGS,
  MOOD_TAGS,
  PEOPLE_PRESENT_TAGS,
  TIME_CONTEXT_TAGS,
} from "@/lib/constants";
import { useToast } from "@/components/ui/toast";

const BEHAVIOR_COLOR: Record<keyof typeof BEHAVIOR_TAGS, TagCategoryColor> = {
  Communication: "communication",
  Movement: "movement",
  Emotional: "emotional",
  Sensory: "sensory",
};

interface Props {
  clipId: string;
  initial: {
    antecedents: string[];
    antecedentNote: string;
    behaviors: string[];
    behaviorNote: string;
    consequences: string[];
    consequenceNote: string;
    location: string;
    timeContext: string;
    peoplePresent: string[];
    moodBefore: string;
    parentInterpretation: string;
    parentFeeling: string;
  };
}

export function EditClipForm({ clipId, initial }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [v, setV] = useState(initial);
  const [saving, setSaving] = useState(false);

  function toggle(key: "antecedents" | "behaviors" | "consequences" | "peoplePresent", tag: string) {
    setV((curr) => ({
      ...curr,
      [key]: curr[key].includes(tag)
        ? curr[key].filter((t) => t !== tag)
        : [...curr[key], tag],
    }));
  }

  function single(key: "location" | "timeContext" | "moodBefore", tag: string) {
    setV((curr) => ({ ...curr, [key]: curr[key] === tag ? "" : tag }));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/clips/${clipId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Could not save changes.");
      }
      toast({ title: "Clip updated" });
      router.push(`/clips/${clipId}`);
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
    <div className="space-y-6">
      <Group title="Antecedent">
        <Chips>
          {ANTECEDENT_TAGS.map((t) => (
            <TagChip
              key={t}
              label={t}
              selected={v.antecedents.includes(t)}
              onClick={() => toggle("antecedents", t)}
              category="antecedent"
            />
          ))}
        </Chips>
        <Note
          value={v.antecedentNote}
          onChange={(s) => setV({ ...v, antecedentNote: s })}
        />
      </Group>

      <Group title="Behavior">
        <div className="space-y-3">
          {(Object.keys(BEHAVIOR_TAGS) as Array<keyof typeof BEHAVIOR_TAGS>).map(
            (group) => (
              <div key={group}>
                <h4 className="mb-1.5 text-xs font-medium text-neutral-500">
                  {group}
                </h4>
                <Chips>
                  {BEHAVIOR_TAGS[group].map((t) => (
                    <TagChip
                      key={t}
                      label={t}
                      selected={v.behaviors.includes(t)}
                      onClick={() => toggle("behaviors", t)}
                      category={BEHAVIOR_COLOR[group]}
                    />
                  ))}
                </Chips>
              </div>
            ),
          )}
        </div>
        <Note
          value={v.behaviorNote}
          onChange={(s) => setV({ ...v, behaviorNote: s })}
        />
      </Group>

      <Group title="Consequence">
        <Chips>
          {CONSEQUENCE_TAGS.map((t) => (
            <TagChip
              key={t}
              label={t}
              selected={v.consequences.includes(t)}
              onClick={() => toggle("consequences", t)}
              category="consequence"
            />
          ))}
        </Chips>
        <Note
          value={v.consequenceNote}
          onChange={(s) => setV({ ...v, consequenceNote: s })}
        />
      </Group>

      <Group title="Context">
        <Sub label="Where">
          <Chips>
            {LOCATION_TAGS.map((t) => (
              <TagChip
                key={t}
                label={t}
                selected={v.location === t}
                onClick={() => single("location", t)}
              />
            ))}
          </Chips>
        </Sub>
        <Sub label="When">
          <Chips>
            {TIME_CONTEXT_TAGS.map((t) => (
              <TagChip
                key={t}
                label={t}
                selected={v.timeContext === t}
                onClick={() => single("timeContext", t)}
              />
            ))}
          </Chips>
        </Sub>
        <Sub label="Who">
          <Chips>
            {PEOPLE_PRESENT_TAGS.map((t) => (
              <TagChip
                key={t}
                label={t}
                selected={v.peoplePresent.includes(t)}
                onClick={() => toggle("peoplePresent", t)}
              />
            ))}
          </Chips>
        </Sub>
        <Sub label="Mood">
          <Chips>
            {MOOD_TAGS.map((t) => (
              <TagChip
                key={t}
                label={t}
                selected={v.moodBefore === t}
                onClick={() => single("moodBefore", t)}
              />
            ))}
          </Chips>
        </Sub>
      </Group>

      <Group title="Reflection">
        <Note
          placeholder="What I think was happening…"
          value={v.parentInterpretation}
          onChange={(s) => setV({ ...v, parentInterpretation: s })}
        />
        <Note
          placeholder="How it made me feel…"
          value={v.parentFeeling}
          onChange={(s) => setV({ ...v, parentFeeling: s })}
        />
      </Group>

      <div className="sticky bottom-0 -mx-4 flex gap-2 bg-neutral-50 px-4 py-4">
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

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {title}
      </h3>
      {children}
    </section>
  );
}
function Sub({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-neutral-500">{label}</p>
      {children}
    </div>
  );
}
function Chips({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}
function Note({
  value,
  onChange,
  placeholder = "Add more detail…",
}: {
  value: string;
  onChange: (s: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={2}
      className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 focus:outline-none"
    />
  );
}
