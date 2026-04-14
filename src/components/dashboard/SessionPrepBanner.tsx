import Link from "next/link";
import { CalendarClock, ChevronRight } from "lucide-react";

export interface UpcomingTherapy {
  childId: string;
  therapyType: string;
  providerName: string | null;
  startsAt: Date;
}

export function SessionPrepBanner({
  upcoming,
}: {
  upcoming: UpcomingTherapy;
}) {
  const hours = Math.max(
    1,
    Math.round((upcoming.startsAt.getTime() - Date.now()) / (60 * 60 * 1000)),
  );

  return (
    <Link
      href={`/session-prep/${upcoming.childId}`}
      className="flex items-center gap-3 rounded-xl border border-secondary-200 bg-secondary-50/60 p-4 transition hover:bg-secondary-50"
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary-100 text-secondary-600">
        <CalendarClock className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-neutral-900">
          {upcoming.therapyType} in {hours} hours
        </p>
        <p className="text-xs text-neutral-600">
          {upcoming.providerName ? `${upcoming.providerName} · ` : ""}
          View your session summary.
        </p>
      </div>
      <ChevronRight className="h-4 w-4 text-neutral-400" />
    </Link>
  );
}

// Compute the next active therapy slot occurring within `withinHours`.
export function computeUpcomingTherapy(
  childId: string,
  schedules: {
    therapy_type: string;
    day_of_week: number;
    time_of_day: string;
    provider_name: string | null;
    is_active: boolean;
  }[],
  withinHours = 24,
): UpcomingTherapy | null {
  const now = new Date();
  let best: UpcomingTherapy | null = null;
  schedules
    .filter((s) => s.is_active)
    .forEach((s) => {
      const next = nextOccurrence(s.day_of_week, s.time_of_day, now);
      if (!next) return;
      const diffH = (next.getTime() - now.getTime()) / (60 * 60 * 1000);
      if (diffH < 0 || diffH > withinHours) return;
      if (!best || next < best.startsAt) {
        best = {
          childId,
          therapyType: s.therapy_type,
          providerName: s.provider_name,
          startsAt: next,
        };
      }
    });
  return best;
}

function nextOccurrence(
  dayOfWeek: number,
  timeOfDay: string,
  from: Date,
): Date | null {
  const parsed = parseTime(timeOfDay);
  if (!parsed) return null;
  const [hours, minutes] = parsed;
  const result = new Date(from);
  let delta = (dayOfWeek - result.getDay() + 7) % 7;
  result.setDate(result.getDate() + delta);
  result.setHours(hours, minutes, 0, 0);
  if (result.getTime() <= from.getTime()) {
    result.setDate(result.getDate() + 7);
  }
  return result;
}

function parseTime(value: string): [number, number] | null {
  const m = value
    .trim()
    .toUpperCase()
    .match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
  if (!m) return null;
  let hours = Number(m[1]);
  const minutes = Number(m[2]);
  const ampm = m[3];
  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return [hours, minutes];
}
