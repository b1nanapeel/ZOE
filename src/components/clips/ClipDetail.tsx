import {
  Clock,
  MapPin,
  Users,
  Smile,
  Quote,
} from "lucide-react";
import { format } from "date-fns";
import { TagChip } from "@/components/tagging/TagChip";
import { behaviorColor } from "@/lib/tag-helpers";

export interface ClipDetailData {
  id: string;
  uploaded_at: string;
  recorded_at: string | null;
  duration_seconds: number;
  antecedents: string[];
  antecedent_note: string | null;
  behaviors: string[];
  behavior_note: string | null;
  consequences: string[];
  consequence_note: string | null;
  location: string | null;
  time_context: string | null;
  people_present: string[];
  mood_before: string | null;
  parent_interpretation: string | null;
  parent_feeling: string | null;
}

export function ClipDetail({
  clip,
  videoUrl,
}: {
  clip: ClipDetailData;
  videoUrl: string | null;
}) {
  const recorded = clip.recorded_at
    ? new Date(clip.recorded_at)
    : new Date(clip.uploaded_at);
  const hasContext =
    clip.location ||
    clip.time_context ||
    clip.people_present.length > 0 ||
    clip.mood_before;
  const hasReflection = clip.parent_interpretation || clip.parent_feeling;

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl bg-black">
        {videoUrl ? (
          <video
            src={videoUrl}
            controls
            playsInline
            className="aspect-video w-full"
          />
        ) : (
          <div className="aspect-video w-full flex items-center justify-center text-neutral-500 text-sm">
            Video unavailable
          </div>
        )}
      </div>

      <div className="text-sm text-neutral-500 font-mono">
        {format(recorded, "EEEE, MMM d · h:mm a")}
        {clip.duration_seconds > 0 && ` · ${clip.duration_seconds}s`}
      </div>

      <Section title="Behavior">
        <ChipRow tags={clip.behaviors} colorFor={behaviorColor} />
        <Note text={clip.behavior_note} />
      </Section>

      <Section title="Antecedent">
        <ChipRow tags={clip.antecedents} fixedColor="antecedent" />
        <Note text={clip.antecedent_note} />
      </Section>

      <Section title="Consequence">
        <ChipRow tags={clip.consequences} fixedColor="consequence" />
        <Note text={clip.consequence_note} />
      </Section>

      {hasContext && (
        <Section title="Context">
          <dl className="space-y-2 text-sm">
            {clip.location && (
              <ContextRow icon={<MapPin className="h-4 w-4" />} label="Location">
                {clip.location}
              </ContextRow>
            )}
            {clip.time_context && (
              <ContextRow icon={<Clock className="h-4 w-4" />} label="When">
                {clip.time_context}
              </ContextRow>
            )}
            {clip.people_present.length > 0 && (
              <ContextRow icon={<Users className="h-4 w-4" />} label="Who">
                {clip.people_present.join(", ")}
              </ContextRow>
            )}
            {clip.mood_before && (
              <ContextRow icon={<Smile className="h-4 w-4" />} label="Mood">
                {clip.mood_before}
              </ContextRow>
            )}
          </dl>
        </Section>
      )}

      {hasReflection && (
        <Section title="Your reflection">
          {clip.parent_interpretation && (
            <Reflection
              label="What I think was happening"
              text={clip.parent_interpretation}
            />
          )}
          {clip.parent_feeling && (
            <Reflection
              label="How it made me feel"
              text={clip.parent_feeling}
            />
          )}
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function ChipRow({
  tags,
  colorFor,
  fixedColor,
}: {
  tags: string[];
  colorFor?: (tag: string) => Parameters<typeof TagChip>[0]["category"];
  fixedColor?: Parameters<typeof TagChip>[0]["category"];
}) {
  if (tags.length === 0) {
    return <p className="text-sm text-neutral-400">None recorded</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((t) => (
        <TagChip
          key={t}
          label={t}
          selected
          onClick={() => {}}
          category={colorFor ? colorFor(t) : fixedColor}
        />
      ))}
    </div>
  );
}

function Note({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <p className="rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
      {text}
    </p>
  );
}

function ContextRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-neutral-400">{icon}</span>
      <div>
        <dt className="text-xs text-neutral-500">{label}</dt>
        <dd className="text-neutral-800">{children}</dd>
      </div>
    </div>
  );
}

function Reflection({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-lg border-l-4 border-primary-300 bg-primary-50/40 px-3 py-2">
      <p className="flex items-center gap-1.5 text-xs font-medium text-primary-700">
        <Quote className="h-3 w-3" />
        {label}
      </p>
      <p className="mt-1 text-sm text-neutral-800">{text}</p>
    </div>
  );
}
