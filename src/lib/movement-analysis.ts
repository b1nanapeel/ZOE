// Client-side movement analysis using MediaPipe Pose Landmarker.
// All inference runs in the browser via WebAssembly. Zero API calls.

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface MovementFeatures {
  framesAnalyzed: number;
  durationSeconds: number;
  handProximityToHead: number; // 0..1 fraction of frames
  centerOfMassSway: number; // 0..1-ish std-dev of hip midpoint
  repetitiveMotionScore: number; // 0..1 oscillation score
  grossMotorActivityLevel: number; // avg per-frame landmark displacement
  descriptions: string[];
  averagePose: PoseLandmark[]; // 33 landmarks averaged
}

const NOSE = 0;
const LEFT_SHOULDER = 11;
const LEFT_WRIST = 15;
const RIGHT_WRIST = 16;
const LEFT_HIP = 23;
const RIGHT_HIP = 24;

const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

let landmarkerPromise: Promise<unknown> | null = null;
let initFailed = false;

async function getLandmarker(): Promise<unknown | null> {
  if (initFailed) return null;
  if (landmarkerPromise) return landmarkerPromise;
  landmarkerPromise = (async () => {
    try {
      const { FilesetResolver, PoseLandmarker } = await import(
        "@mediapipe/tasks-vision"
      );
      const filesetResolver = await FilesetResolver.forVisionTasks(WASM_URL);
      return await PoseLandmarker.createFromOptions(filesetResolver, {
        baseOptions: { modelAssetPath: MODEL_URL },
        runningMode: "VIDEO",
        numPoses: 1,
      });
    } catch (e) {
      console.warn("[movement] init failed:", e);
      initFailed = true;
      return null;
    }
  })();
  return landmarkerPromise;
}

function seek(video: HTMLVideoElement, t: number): Promise<void> {
  return new Promise((resolve) => {
    const handler = () => {
      video.removeEventListener("seeked", handler);
      resolve();
    };
    video.addEventListener("seeked", handler);
    try {
      video.currentTime = Math.min(t, Math.max(0, video.duration - 0.05));
    } catch {
      resolve();
    }
  });
}

export async function extractMovementFeatures(
  file: Blob,
): Promise<MovementFeatures | null> {
  if (typeof window === "undefined") return null;

  const url = URL.createObjectURL(file);
  let video: HTMLVideoElement | null = null;
  try {
    const landmarkerRaw = await getLandmarker();
    if (!landmarkerRaw) return null;
    const landmarker = landmarkerRaw as {
      detectForVideo: (
        input: HTMLCanvasElement | HTMLVideoElement,
        ts: number,
      ) => { landmarks?: PoseLandmark[][] };
    };

    video = document.createElement("video");
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    await new Promise<void>((resolve, reject) => {
      const ok = () => resolve();
      const fail = () => reject(new Error("video load failed"));
      video!.addEventListener("loadedmetadata", ok, { once: true });
      video!.addEventListener("error", fail, { once: true });
    });

    const duration = isFinite(video.duration) ? video.duration : 0;
    if (duration <= 0) return null;

    const interval = 2;
    const samples: number[] = [];
    for (let t = 0; t <= duration; t += interval) samples.push(t);
    if (samples.length === 0) samples.push(0);

    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const poses: PoseLandmark[][] = [];
    let ts = 0;
    for (const t of samples) {
      await seek(video, t);
      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ts += 50;
        const result = landmarker.detectForVideo(canvas, ts);
        if (result?.landmarks && result.landmarks[0]) {
          poses.push(result.landmarks[0]);
        }
      } catch {
        // single-frame failure — skip
      }
    }

    if (poses.length === 0) return null;
    return computeFeatures(poses, duration);
  } catch (e) {
    console.warn(
      "[movement] failed:",
      e instanceof Error ? e.message : e,
    );
    return null;
  } finally {
    URL.revokeObjectURL(url);
    if (video) {
      video.removeAttribute("src");
      try {
        video.load();
      } catch {
        // ignore
      }
    }
  }
}

function computeFeatures(
  poses: PoseLandmark[][],
  duration: number,
): MovementFeatures {
  // 1) hands near head (wrist y above nose y in normalized coords — y is top-down)
  let handsNearHead = 0;
  poses.forEach((p) => {
    const noseY = p[NOSE]?.y ?? 0.5;
    const lwY = p[LEFT_WRIST]?.y ?? 1;
    const rwY = p[RIGHT_WRIST]?.y ?? 1;
    if (lwY < noseY + 0.1 || rwY < noseY + 0.1) handsNearHead++;
  });
  const handProximityToHead = poses.length ? handsNearHead / poses.length : 0;

  // 2) center-of-mass sway: std-dev of hip midpoint
  const midX: number[] = [];
  const midY: number[] = [];
  poses.forEach((p) => {
    const lh = p[LEFT_HIP];
    const rh = p[RIGHT_HIP];
    if (!lh || !rh) return;
    midX.push((lh.x + rh.x) / 2);
    midY.push((lh.y + rh.y) / 2);
  });
  const sxx = midX.length ? stdDev(midX) : 0;
  const syy = midY.length ? stdDev(midY) : 0;
  const centerOfMassSway = Math.sqrt(sxx * sxx + syy * syy);

  // 3) gross motor: avg per-landmark displacement between consecutive frames
  let totalDisp = 0;
  let count = 0;
  for (let i = 1; i < poses.length; i++) {
    const a = poses[i - 1];
    const b = poses[i];
    const n = Math.min(a.length, b.length);
    let frameDisp = 0;
    let used = 0;
    for (let j = 0; j < n; j++) {
      const la = a[j];
      const lb = b[j];
      if (!la || !lb) continue;
      frameDisp += Math.hypot(lb.x - la.x, lb.y - la.y);
      used++;
    }
    if (used > 0) {
      totalDisp += frameDisp / used;
      count++;
    }
  }
  const grossMotorActivityLevel = count ? totalDisp / count : 0;

  // 4) repetitive motion: zero-crossing rate of detrended wrist Y trajectory
  const wristYs = poses.map((p) => p[LEFT_WRIST]?.y ?? 0);
  const repetitiveMotionScore = oscillationScore(wristYs);

  // 5) average pose
  const numLandmarks = 33;
  const averagePose: PoseLandmark[] = [];
  for (let j = 0; j < numLandmarks; j++) {
    let sx = 0;
    let sy = 0;
    let sz = 0;
    let c = 0;
    poses.forEach((p) => {
      const lm = p[j];
      if (!lm) return;
      sx += lm.x;
      sy += lm.y;
      sz += lm.z;
      c++;
    });
    averagePose.push({
      x: c ? sx / c : 0.5,
      y: c ? sy / c : 0.5,
      z: c ? sz / c : 0,
    });
  }

  // 6) descriptions
  const descriptions: string[] = [];
  if (handProximityToHead > 0.4 && repetitiveMotionScore > 0.3) {
    descriptions.push(
      "Repetitive hand movement detected near head level.",
    );
  } else if (handProximityToHead > 0.4) {
    descriptions.push("Hands frequently positioned near head or face.");
  }
  if (centerOfMassSway > 0.05) {
    descriptions.push("Body sway detected — possible rocking pattern.");
  }
  if (grossMotorActivityLevel < 0.005) {
    descriptions.push("Low overall movement — child appears stationary.");
  } else if (grossMotorActivityLevel > 0.05) {
    descriptions.push("High overall movement — very active.");
  }
  if (descriptions.length === 0) {
    descriptions.push("No notable repetitive movements detected.");
  }

  return {
    framesAnalyzed: poses.length,
    durationSeconds: round(duration, 2),
    handProximityToHead: round(handProximityToHead, 3),
    centerOfMassSway: round(centerOfMassSway, 4),
    repetitiveMotionScore: round(repetitiveMotionScore, 3),
    grossMotorActivityLevel: round(grossMotorActivityLevel, 4),
    descriptions,
    averagePose,
  };
}

function stdDev(xs: number[]): number {
  if (xs.length === 0) return 0;
  const m = xs.reduce((s, n) => s + n, 0) / xs.length;
  return Math.sqrt(xs.reduce((s, n) => s + (n - m) ** 2, 0) / xs.length);
}

function oscillationScore(series: number[]): number {
  if (series.length < 4) return 0;
  const mean = series.reduce((s, n) => s + n, 0) / series.length;
  const detrended = series.map((v) => v - mean);
  let crossings = 0;
  for (let i = 1; i < detrended.length; i++) {
    if (
      (detrended[i] >= 0 && detrended[i - 1] < 0) ||
      (detrended[i] < 0 && detrended[i - 1] >= 0)
    ) {
      crossings++;
    }
  }
  // Normalize: more zero-crossings ⇒ more oscillation. Cap at 1.
  return Math.min(1, crossings / (series.length - 1));
}

function round(n: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}
