import Link from "next/link";
import { format } from "date-fns";
import { MapPin, Film } from "lucide-react";
import { behaviorColor } from "@/lib/tag-helpers";

export interface ClipCardData {
  id: string;
  uploaded_at: string;
  thumbnail_url: string | null;
  behaviors: string[];
  antecedent_note: string | null;
  location: string | null;
  duration_seconds: number;
}

export function ClipCard({ clip }: { clip: ClipCardData }) {
  const time = format(new Date(clip.uploaded_at), "h:mm a");
  const visible = clip.behaviors.slice(0, 3);
  const overflow = clip.behaviors.length - visible.length;

  return (
    <Link
      href={`/clips/${clip.id}`}
      className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm transition hover:shadow-md"
    >
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
        {clip.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={clip.thumbnail_url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-400">
            <Film className="h-6 w-6" />
          </div>
        )}
        {clip.duration_seconds > 0 && (
          <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 font-mono text-[12px] text-white">
            {clip.duration_seconds}s
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap gap-1.5">
          {visible.map((b) => {
            const c = behaviorColor(b);
            const cls =
              c === "communication"
                ? "bg-blue-50 text-blue-700"
                : c === "movement"
                  ? "bg-amber-50 text-amber-700"
                  : c === "emotional"
                    ? "bg-pink-50 text-pink-700"
                    : c === "sensory"
                      ? "bg-violet-50 text-violet-700"
                      : "bg-neutral-100 text-neutral-700";
            return (
              <span
                key={b}
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}
              >
                {b}
              </span>
            );
          })}
          {overflow > 0 && (
            <span className="text-xs text-neutral-400">+{overflow}</span>
          )}
        </div>
        {clip.antecedent_note && (
          <p className="mt-1 line-clamp-1 text-sm text-neutral-700">
            {clip.antecedent_note}
          </p>
        )}
        <div className="mt-1.5 flex items-center gap-3 text-xs text-neutral-500">
          <span className="font-mono">{time}</span>
          {clip.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {clip.location}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
