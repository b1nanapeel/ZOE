"use client";

import { useEffect, useRef } from "react";
import { Waves } from "lucide-react";
import {
  describeAudioFeatures,
  type AudioFeatures,
} from "@/lib/audio-analysis";

export function SoundProfileCard({ features }: { features: AudioFeatures }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvas.clientWidth || 320;
    const cssHeight = 64;
    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    const peaks = features.waveformPeaks ?? [];
    if (peaks.length === 0) return;
    const mid = cssHeight / 2;
    const barWidth = Math.max(1, cssWidth / peaks.length);

    ctx.fillStyle = "#c9a84c"; // gold
    peaks.forEach((p, i) => {
      const h = Math.max(1, p * (cssHeight - 6));
      const x = i * barWidth;
      ctx.fillRect(x, mid - h / 2, Math.max(1, barWidth - 1), h);
    });
  }, [features]);

  const desc = describeAudioFeatures(features);

  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Sound profile
      </h3>
      <article className="rounded-xl border border-l-4 border-l-primary-500 border-neutral-200 bg-neutral-100 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-500/15 text-primary-500">
            <Waves className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-neutral-900">
              {desc.headline}
            </p>
            <canvas
              ref={canvasRef}
              className="mt-3 block w-full rounded-md bg-neutral-50/40"
              style={{ height: 64 }}
            />
            <dl className="mt-3 grid grid-cols-1 gap-1 text-xs text-neutral-600 sm:grid-cols-2">
              <div>{desc.pitch}</div>
              <div>{desc.pace}</div>
              <div className="sm:col-span-2">{desc.pauses}</div>
            </dl>
            <p className="mt-2 font-mono text-xs text-neutral-500">
              Peak energy {(features.peakEnergy * 100).toFixed(0)}% · sample
              rate {features.sampleRate} Hz · {features.durationSeconds.toFixed(1)}s
            </p>
            <p className="mt-2 text-xs italic text-neutral-500">
              All audio analysis happened in your browser — no audio left your
              device.
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}
