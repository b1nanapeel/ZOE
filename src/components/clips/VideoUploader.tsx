"use client";

import { useRef, useState } from "react";
import { Film, Upload, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepShell } from "@/components/tagging/StepShell";
import { createClient } from "@/lib/supabase-browser";

export interface UploadedVideo {
  videoPath: string;
  durationSeconds: number;
  fileSizeBytes: number;
  previewUrl: string;
  fileName: string;
}

async function readDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.src = url;
    v.onloadedmetadata = () => {
      const d = isFinite(v.duration) ? Math.round(v.duration) : 0;
      URL.revokeObjectURL(url);
      resolve(d);
    };
    v.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
  });
}

export function VideoUploader({
  uploaded,
  onUploaded,
  onNext,
  stepIndex,
  totalSteps,
}: {
  uploaded: UploadedVideo | null;
  onUploaded: (v: UploadedVideo | null) => void;
  onNext: () => void;
  stepIndex: number;
  totalSteps: number;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    setProgress(5);

    try {
      const durationSeconds = await readDuration(file);
      setProgress(15);

      const res = await fetch("/api/clips/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type || "video/mp4",
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Could not start upload.");
      }
      const { token, path } = (await res.json()) as {
        token: string;
        path: string;
      };

      setProgress(40);
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from("clips")
        .uploadToSignedUrl(path, token, file, {
          contentType: file.type || "video/mp4",
          upsert: false,
        });
      if (uploadError) throw new Error(uploadError.message);
      setProgress(95);

      onUploaded({
        videoPath: path,
        durationSeconds,
        fileSizeBytes: file.size,
        previewUrl: URL.createObjectURL(file),
        fileName: file.name,
      });
      setProgress(100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
      onUploaded(null);
    } finally {
      setUploading(false);
    }
  }

  return (
    <StepShell
      title="Upload"
      question="Add a video"
      onNext={onNext}
      nextDisabled={!uploaded || uploading}
      stepIndex={stepIndex}
      totalSteps={totalSteps}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {!uploaded && !uploading && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-neutral-300 bg-white px-6 py-12 text-center transition hover:border-primary-500 hover:bg-primary-50/40"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <Upload className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium text-neutral-900">
              Tap to choose a video
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              From your camera roll or files
            </p>
          </div>
        </button>
      )}

      {uploading && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <Film className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-medium text-neutral-700">
              Uploading…
            </span>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full bg-primary-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 font-mono text-xs text-neutral-500">{progress}%</p>
        </div>
      )}

      {uploaded && !uploading && (
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <video
            src={uploaded.previewUrl}
            controls
            playsInline
            className="w-full rounded-lg bg-black"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-sm font-medium text-primary-700">
                <CheckCircle2 className="h-4 w-4" />
                Uploaded
              </p>
              <p className="truncate text-xs text-neutral-500">
                {uploaded.fileName} · {uploaded.durationSeconds}s
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Replace
            </Button>
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </StepShell>
  );
}

