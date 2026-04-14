import {
  format,
  isToday,
  isYesterday,
  startOfDay,
} from "date-fns";
import { ClipCard, type ClipCardData } from "./ClipCard";

function dateLabel(d: Date) {
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEEE, MMM d");
}

export function ClipList({ clips }: { clips: ClipCardData[] }) {
  if (clips.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-200 bg-white px-6 py-12 text-center">
        <p className="text-base font-medium text-neutral-700">
          No clips match these filters.
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          Try clearing a filter, or record a new clip.
        </p>
      </div>
    );
  }

  const groups = new Map<string, ClipCardData[]>();
  clips.forEach((c) => {
    const key = startOfDay(new Date(c.uploaded_at)).toISOString();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(c);
  });

  return (
    <div className="space-y-6">
      {[...groups.entries()].map(([key, items]) => (
        <section key={key}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {dateLabel(new Date(key))}
          </h3>
          <ul className="space-y-2">
            {items.map((clip) => (
              <li key={clip.id}>
                <ClipCard clip={clip} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
