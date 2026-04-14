"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
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
  "analyzing",
  "antecedent",
  "behavior",
  "consequence",
  "context",
  "reflection",
  "saved",
] as const;
type Step = (typeof STEPS)[number];
const PROGRESS_STEPS: Step[] = [
  "upload",
  "antecedent",
  "behavior",
  "consequence",
  "context",
  "reflection",
];
const TOTAL = PROGRESS_STEPS.length;

interface AiResult {
  suggestedBehaviors: string[];
  suggestedAntecedents: string[];
  suggestedConsequences: string[];
  suggestedMood: string | null;
  confidence: number;
  narrativeObservation: string;
}

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
  ai: AiResult | null;
  aiSuggested: {
    antecedents: Set<string>;
    behaviors: Set<string>;
    consequences: Set<string>;
  };
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
  ai: null,
  aiSuggested: {
    antecedents: new Set(),
    behaviors: new Set(),
    consequences: new Set(),
  },
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

  const progressIdx = PROGRESS_STEPS.indexOf(step);
  const progressShown = progressIdx >= 0 ? progressIdx : 0;

  function go(next: Step) {
    setError(null);
    setStep(next);
  }

  async function runAiAnalysis(video: UploadedVideo) {
    try {
      const statusRes = await fetch("/api/ai-status", { cache: "no-store" });
      const status = (await statusRes.json().catch(() => null)) as {
        available?: boolean;
        configured?: boolean;
      } | null;

      if (!status?.available) {
        if (status?.configured === false) {
          // No key configured at all — silent.
        } else {
          toast({
            title: "AI analysis is resting",
            description:
              "Tag this clip yourself and ZOE will analyze future clips when available.",
          });
        }
        go("antecedent");
        return;
      }

      go("analyzing");

      const res = await fetch("/api/clips/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoPath: video.videoPath }),
      });
      const body = (await res.json().catch(() => null)) as {
        suggestions?: AiResult;
      } | null;

      if (body?.suggestions) {
        const ai = body.suggestions;
        setState((s) => ({
          ...s,
          ai,
          antecedents: [...new Set([...s.antecedents, ...ai.suggestedAntecedents])],
          behaviors: [...new Set([...s.behaviors, ...ai.suggestedBehaviors])],
          consequences: [
            ...new Set([...s.consequences, ...ai.suggestedConsequences]),
          ],
          context: {
            ...s.context,
            moodBefore: s.context.moodBefore || (ai.suggestedMood ?? ""),
          },
          aiSuggested: {
            antecedents: new Set(ai.suggestedAntecedents),
            behaviors: new Set(ai.suggestedBehaviors),
            consequences: new Set(ai.suggestedConsequences),
          },
        }));
      }
    } catch {
      // Silent — never block the upload flow.
    } finally {
      go("antecedent");
    }
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
          aiObservation: state.ai?.narrativeObservation || null,
          aiConfidence: state.ai?.confidence ?? null,
          audioFeatures: state.video.audioFeatures ?? null,
          movementFeatures: state.video.movementFeatures ?? null,
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
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-500/15 text-primary-500">
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

  if (step === "analyzing") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-primary-500/20" />
          <Sparkles className="relative h-8 w-8 text-primary-500" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-neutral-900">
          ZOE is watching…
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          Pre-tagging what we can observe. You'll review and edit next.
        </p>
      </div>
    );
  }

  return (
    <>
      {step === "upload" && (
        <VideoUploader
          uploaded={state.video}
          onUploaded={(v) => setState({ ...state, video: v })}
          onNext={() => state.video && runAiAnalysis(state.video)}
          stepIndex={progressShown}
          totalSteps={TOTAL}
        />
      )}
      {step === "antecedent" && (
        <AntecedentStep
          selected={state.antecedents}
          note={state.antecedentNote}
          onChange={(c) =>
            setState({
              ...state,
              antecedents: c.selected,
              antecedentNote: c.note,
            })
          }
          onNext={() => go("behavior")}
          onBack={() => go("upload")}
          stepIndex={progressShown}
          totalSteps={TOTAL}
          aiSuggested={state.aiSuggested.antecedents}
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
          stepIndex={progressShown}
          totalSteps={TOTAL}
          aiSuggested={state.aiSuggested.behaviors}
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
          stepIndex={progressShown}
          totalSteps={TOTAL}
          aiSuggested={state.aiSuggested.consequences}
        />
      )}
      {step === "context" && (
        <ContextStep
          values={state.context}
          onChange={(c) => setState({ ...state, context: c })}
          onNext={() => go("reflection")}
          onSkip={() => go("reflection")}
          onBack={() => go("consequence")}
          stepIndex={progressShown}
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
          stepIndex={progressShown}
          totalSteps={TOTAL}
        />
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </>
  );
}
