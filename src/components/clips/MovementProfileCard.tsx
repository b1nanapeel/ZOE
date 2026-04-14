import { Activity } from "lucide-react";
import type { MovementFeatures } from "@/lib/movement-analysis";

const CONNECTIONS: Array<[number, number]> = [
  [0, 11],
  [0, 12],
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28],
];

const KEY_POINTS = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];

export function MovementProfileCard({
  features,
}: {
  features: MovementFeatures;
}) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Movement profile
      </h3>
      <article className="rounded-xl border border-l-4 border-l-primary-500 border-neutral-200 bg-neutral-100 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-500/15 text-primary-500">
            <Activity className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <ul className="space-y-1 text-sm text-neutral-800">
              {features.descriptions.map((d, i) => (
                <li key={i}>· {d}</li>
              ))}
            </ul>

            <div className="mt-3 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              <StickFigure pose={features.averagePose} />

              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs text-neutral-500 sm:grid-cols-1">
                <Stat
                  label="Frames analyzed"
                  value={features.framesAnalyzed.toString()}
                />
                <Stat
                  label="Hands near head"
                  value={`${Math.round(features.handProximityToHead * 100)}%`}
                />
                <Stat
                  label="Body sway"
                  value={(features.centerOfMassSway * 100).toFixed(1)}
                />
                <Stat
                  label="Repetitive motion"
                  value={features.repetitiveMotionScore.toFixed(2)}
                />
                <Stat
                  label="Activity level"
                  value={(features.grossMotorActivityLevel * 100).toFixed(1)}
                />
              </dl>
            </div>

            <p className="mt-3 text-xs italic text-neutral-500">
              Pose detection ran in your browser via MediaPipe. No video frames
              left your device.
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-neutral-500">{label}</dt>
      <dd className="text-neutral-800">{value}</dd>
    </>
  );
}

function StickFigure({ pose }: { pose: { x: number; y: number }[] }) {
  if (!pose || pose.length === 0) return null;
  return (
    <svg
      viewBox="0 0 100 100"
      className="h-32 w-32 flex-shrink-0 rounded-md bg-neutral-50/40"
      aria-label="Average detected pose"
    >
      {CONNECTIONS.map(([a, b], i) => {
        const pa = pose[a];
        const pb = pose[b];
        if (!pa || !pb) return null;
        return (
          <line
            key={i}
            x1={pa.x * 100}
            y1={pa.y * 100}
            x2={pb.x * 100}
            y2={pb.y * 100}
            stroke="#c9a84c"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        );
      })}
      {KEY_POINTS.map((idx) => {
        const p = pose[idx];
        if (!p) return null;
        return (
          <circle
            key={idx}
            cx={p.x * 100}
            cy={p.y * 100}
            r={idx === 0 ? 3.5 : 1.5}
            fill="#c9a84c"
          />
        );
      })}
    </svg>
  );
}
