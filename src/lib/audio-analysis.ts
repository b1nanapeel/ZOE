// Client-side audio prosody extraction. Zero network calls.
// All math runs on the browser's Web Audio API + plain JS.

export interface AudioFeatures {
  durationSeconds: number;
  avgPitchHz: number; // 0 if unvoiced or no audio
  pitchStdHz: number;
  speechRatePerSec: number; // voiced segments per second
  pauseRatio: number; // 0..1 (silence / total)
  vocalizationSeconds: number;
  peakEnergy: number; // 0..1
  waveformPeaks: number[]; // ~200 points, 0..1
  sampleRate: number;
}

const FRAME_MS = 25;
const HOP_MS = 10;
const MIN_PITCH = 50;
const MAX_PITCH = 500;
const ENERGY_FLOOR = 0.012; // RMS threshold for "voiced"
const PEAK_BUCKETS = 200;

export async function extractAudioFeatures(
  file: Blob,
): Promise<AudioFeatures | null> {
  if (typeof window === "undefined") return null;
  const AudioCtx =
    (window.AudioContext as typeof AudioContext | undefined) ??
    (
      window as unknown as {
        webkitAudioContext?: typeof AudioContext;
      }
    ).webkitAudioContext;
  if (!AudioCtx) return null;

  let ctx: AudioContext | null = null;
  try {
    const arrayBuffer = await file.arrayBuffer();
    ctx = new AudioCtx();
    const audio = await ctx.decodeAudioData(arrayBuffer.slice(0));
    const channel = audio.getChannelData(0);
    const sr = audio.sampleRate;
    const features = computeFeatures(channel, sr);
    return features;
  } catch (e) {
    console.warn(
      "[audio-analysis] decode failed:",
      e instanceof Error ? e.message : e,
    );
    return null;
  } finally {
    try {
      await ctx?.close();
    } catch {
      // ignore
    }
  }
}

function computeFeatures(samples: Float32Array, sr: number): AudioFeatures {
  const frameSize = Math.floor((FRAME_MS / 1000) * sr);
  const hop = Math.floor((HOP_MS / 1000) * sr);
  const totalFrames = Math.max(0, Math.floor((samples.length - frameSize) / hop));

  const pitches: number[] = [];
  const energies: number[] = [];
  const voiced: boolean[] = [];

  let peakAbs = 0;
  for (let i = 0; i < samples.length; i++) {
    const a = Math.abs(samples[i]);
    if (a > peakAbs) peakAbs = a;
  }

  for (let f = 0; f < totalFrames; f++) {
    const start = f * hop;
    const frame = samples.subarray(start, start + frameSize);
    const energy = rms(frame);
    energies.push(energy);
    const isVoiced = energy >= ENERGY_FLOOR;
    voiced.push(isVoiced);
    if (isVoiced) {
      const p = autocorrelatePitch(frame, sr);
      if (p > 0) pitches.push(p);
    }
  }

  const avgPitch = pitches.length
    ? pitches.reduce((s, n) => s + n, 0) / pitches.length
    : 0;
  const pitchStd = pitches.length
    ? Math.sqrt(
        pitches.reduce((s, n) => s + (n - avgPitch) ** 2, 0) / pitches.length,
      )
    : 0;

  // Count voiced segments (transitions from unvoiced→voiced).
  let segments = 0;
  for (let i = 1; i < voiced.length; i++) {
    if (voiced[i] && !voiced[i - 1]) segments++;
  }
  if (voiced[0]) segments++;
  const durationSeconds = samples.length / sr;
  const speechRatePerSec =
    durationSeconds > 0 ? segments / durationSeconds : 0;

  const voicedFrames = voiced.filter(Boolean).length;
  const vocalizationSeconds = voicedFrames * (HOP_MS / 1000);
  const pauseRatio =
    durationSeconds > 0
      ? Math.max(0, Math.min(1, 1 - vocalizationSeconds / durationSeconds))
      : 0;

  const waveformPeaks = downsamplePeaks(samples, PEAK_BUCKETS);

  return {
    durationSeconds: round(durationSeconds, 2),
    avgPitchHz: round(avgPitch, 1),
    pitchStdHz: round(pitchStd, 1),
    speechRatePerSec: round(speechRatePerSec, 2),
    pauseRatio: round(pauseRatio, 2),
    vocalizationSeconds: round(vocalizationSeconds, 2),
    peakEnergy: round(peakAbs, 3),
    waveformPeaks,
    sampleRate: sr,
  };
}

function rms(frame: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < frame.length; i++) sum += frame[i] * frame[i];
  return Math.sqrt(sum / frame.length);
}

// Naive autocorrelation pitch detection over the lag range corresponding
// to MIN_PITCH..MAX_PITCH Hz. Adequate for "is there pitch and roughly what".
function autocorrelatePitch(frame: Float32Array, sr: number): number {
  const minLag = Math.floor(sr / MAX_PITCH);
  const maxLag = Math.floor(sr / MIN_PITCH);
  let bestLag = -1;
  let bestCorr = 0;
  let prev = 0;
  let positiveSlope = false;

  for (let lag = minLag; lag <= maxLag && lag < frame.length; lag++) {
    let sum = 0;
    for (let i = 0; i < frame.length - lag; i++) {
      sum += frame[i] * frame[i + lag];
    }
    if (sum > prev) positiveSlope = true;
    if (positiveSlope && sum < prev && bestLag === -1) {
      bestLag = lag - 1;
      bestCorr = prev;
    } else if (sum > bestCorr) {
      bestCorr = sum;
      bestLag = lag;
    }
    prev = sum;
  }
  if (bestLag <= 0) return 0;
  // Confidence floor — autocorrelation magnitude must be non-trivial.
  if (bestCorr < frame.length * 0.0005) return 0;
  return sr / bestLag;
}

function downsamplePeaks(samples: Float32Array, buckets: number): number[] {
  if (samples.length === 0) return [];
  const bucketSize = Math.max(1, Math.floor(samples.length / buckets));
  const peaks: number[] = [];
  for (let b = 0; b < buckets; b++) {
    let max = 0;
    const start = b * bucketSize;
    const end = Math.min(samples.length, start + bucketSize);
    for (let i = start; i < end; i++) {
      const a = Math.abs(samples[i]);
      if (a > max) max = a;
    }
    peaks.push(round(max, 3));
  }
  return peaks;
}

function round(n: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

// =========================================================
// Plain-language summarizer (server- and client-safe)
// =========================================================
export function describeAudioFeatures(f: AudioFeatures): {
  headline: string;
  pitch: string;
  pace: string;
  pauses: string;
} {
  const pitchVar =
    f.pitchStdHz < 15
      ? "minimal"
      : f.pitchStdHz < 35
        ? "moderate"
        : f.pitchStdHz < 70
          ? "expressive"
          : "highly varied";

  const pace =
    f.speechRatePerSec === 0
      ? "no voiced segments detected"
      : f.speechRatePerSec < 0.4
        ? "slow"
        : f.speechRatePerSec < 1
          ? "steady"
          : f.speechRatePerSec < 2
            ? "rapid"
            : "very rapid";

  const pauses =
    f.pauseRatio < 0.2
      ? "almost continuous vocalization"
      : f.pauseRatio < 0.5
        ? "balanced sound and silence"
        : f.pauseRatio < 0.8
          ? "mostly quiet with brief sounds"
          : "mostly silent";

  const headline =
    f.vocalizationSeconds === 0
      ? "No vocalization detected."
      : `${f.vocalizationSeconds.toFixed(1)} seconds of vocalization with ${pitchVar} pitch variation.`;

  return {
    headline,
    pitch:
      f.avgPitchHz === 0
        ? "Pitch not detected (likely no clear vocal pitch)."
        : `Average pitch ${Math.round(f.avgPitchHz)} Hz, ${pitchVar} variation (±${Math.round(f.pitchStdHz)} Hz).`,
    pace: `Pace: ${pace} (${f.speechRatePerSec.toFixed(2)} voiced segments / second).`,
    pauses: `Quiet ratio: ${Math.round(f.pauseRatio * 100)}% — ${pauses}.`,
  };
}
