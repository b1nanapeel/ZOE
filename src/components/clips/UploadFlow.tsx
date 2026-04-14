"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { AntecedentStep } from "@/components/tagging/AntecedentStep";
import { BehaviorStep } from "@/components/tagging/BehaviorStep";
import { ConsequenceStep } from "@/components/tagging/ConsequenceStep";
import { ContextStep, type ContextValues } from "@/components/tagging/ContextStep";
import {
  ReflectionStep,
  type ReflectionValues,
} from "@/components/tagging/ReflectionStep";
import { VideoUploader, type UploadedVideo } from "./VideoUploader";

const STEPS = [
  "upload",
  "antecedent",
  "behavior",
  "consequence",
  "context",
  "reflection",
  "saved",
] as const;
type Step = (typeof STEPS)[number];
const TOTAL = STEPS.length - 1; // exclude "saved" from progress

interface State {
  video: UploadedVideo | null;
  antecedents: string[];
  antecedentNote: string;
  behaviors: string[];
  behaviorNote: string;
  consequences: string[];
  consequenceNote: string;
  context: ContextValues;
  reflection: ReflectionValues;
}

const INITIAL: State = {
  video: null,
  antecedents: [],
  antecedentNote: "",
  behaviors: [],
  behaviorNote: "",
  consequences: [],
  consequenceNote: "",
  context: {
    location: "",
    timeContext: "",
    peoplePresent: [],
    moodBefore: "",
  },
  reflection: { parentInterpretation: "", parentFeeling: "" },
};

export function UploadFlow({
  childId,
  childName,
}: {
  childId: string;
  childName: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("upload");
  const [state, setState] = useState<State>(INITIAL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const idx = STEPS.indexOf(step);

  function go(next: Step) {
    setError(null);
    setStep(next);
  }

  async function save() {
    if (!state.video) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/clips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          videoUrl: state.video.videoPath,
          durationSeconds: state.video.durationSeconds,
          fileSizeBytes: state.video.fileSizeBytes,
          antecedents: state.antecedents,
          antecedentNote: state.antecedentNote || null,
          behaviors: state.behaviors,
          behaviorNote: state.behaviorNote || null,
          consequences: state.consequences,
          consequenceNote: state.consequenceNote || null,
          location: state.context.location || null,
          timeContext: state.context.timeContext || null,
          peoplePresent: state.context.peoplePresent,
          moodBefore: state.context.moodBefore || null,
          parentInterpretation: state.reflection.parentInterpretation || null,
          parentFeeling: state.reflection.parentFeeling || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Could not save clip.");
      }
      setStep("saved");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not save clip.";
      setError(msg);
      toast({ title: "Could not save clip", description: msg, variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (step === "saved") toast({ title: "Clip saved" });
  }, [step, toast]);

  if (step === "saved") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-600">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-neutral-900">
          Clip saved
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          It's now part of {childName}'s story.
        </p>
        <div className="mt-6 flex flex-col gap-2 w-full max-w-xs">
          <Button
            block
            onClick={() => {
              router.replace("/");
              router.refresh();
            }}
          >
            Back to home
          </Button>
          <Button
            variant="secondary"
            block
            onClick={() => {
              setState(INITIAL);
              setStep("upload");
            }}
          >
            Add another clip
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {step === "upload" && (
        <VideoUploader
          uploaded={state.video}
          onUploaded={(v) => setState({ ...state, video: v })}
          onNext={() => go("antecedent")}
          stepIndex={idx}
          totalSteps={TOTAL}
        />
      )}
      {step === "antecedent" && (
        <AntecedentStep
          selected={state.antecedents}
          note={state.antecedentNote}
          onChange={(c) =>
            setState({ ...state, antecedents: c.selected, antecedentNote: c.note })
          }
          onNext={() => go("behavior")}
          onBack={() => go("upload")}
          stepIndex={idx}
          totalSteps={TOTAL}
        />
      )}
      {step === "behavior" && (
        <BehaviorStep
          childName={childName}
          selected={state.behaviors}
          note={state.behaviorNote}
          onChange={(c) =>
            setState({ ...state, behaviors: c.selected, behaviorNote: c.note })
          }
          onNext={() => go("consequence")}
          onBack={() => go("antecedent")}
          stepIndex={idx}
          totalSteps={TOTAL}
        />
      )}
      {step === "consequence" && (
        <ConsequenceStep
          selected={state.consequences}
          note={state.consequenceNote}
          onChange={(c) =>
            setState({
              ...state,
              consequences: c.selected,
              consequenceNote: c.note,
            })
          }
          onNext={() => go("context")}
          onBack={() => go("behavior")}
          stepIndex={idx}
          totalSteps={TOTAL}
        />
      )}
      {step === "context" && (
        <ContextStep
          values={state.context}
          onChange={(c) => setState({ ...state, context: c })}
          onNext={() => go("reflection")}
          onSkip={() => go("reflection")}
          onBack={() => go("consequence")}
          stepIndex={idx}
          totalSteps={TOTAL}
        />
      )}
      {step === "reflection" && (
        <ReflectionStep
          values={state.reflection}
          onChange={(r) => setState({ ...state, reflection: r })}
          onSave={save}
          onSkip={save}
          onBack={() => go("context")}
          saving={saving}
          stepIndex={idx}
          totalSteps={TOTAL}
        />
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </>
  );
}
