"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Camera, Tag as TagIcon, TrendingUp } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Input, Label } from "@/components/ui/input";
import {
  COMMUNICATION_LEVELS,
  DIAGNOSIS_STATUSES,
  THERAPY_OPTIONS,
} from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createClient } from "@/lib/supabase-browser";

type Step = 1 | 2 | 3;

interface ChildDraft {
  name: string;
  dateOfBirth: string;
  communicationLevel: (typeof COMMUNICATION_LEVELS)[number]["value"] | "";
  diagnosisStatus: (typeof DIAGNOSIS_STATUSES)[number]["value"] | "";
  therapies: string[];
}

const TUTORIAL = [
  {
    icon: Camera,
    title: "Record a clip when you notice something",
    body: "A few seconds of video is enough to capture what matters.",
  },
  {
    icon: TagIcon,
    title: "Tag what happened — before, during, and after",
    body: "We use the ABC framework therapists already know.",
  },
  {
    icon: TrendingUp,
    title: "See patterns build over time",
    body: "Trends, contexts, and shared insight for your care team.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [tutorialIndex, setTutorialIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [child, setChild] = useState<ChildDraft>({
    name: "",
    dateOfBirth: "",
    communicationLevel: "",
    diagnosisStatus: "",
    therapies: [],
  });

  function toggleTherapy(t: string) {
    setChild((prev) => ({
      ...prev,
      therapies: prev.therapies.includes(t)
        ? prev.therapies.filter((x) => x !== t)
        : [...prev.therapies, t],
    }));
  }

  function validateChild(): string | null {
    if (!child.name.trim()) return "Please add your child's first name.";
    if (!child.dateOfBirth) return "Please add a date of birth.";
    if (!child.communicationLevel) return "Pick a communication level.";
    if (!child.diagnosisStatus) return "Pick a diagnosis status.";
    return null;
  }

  async function finish() {
    setSaving(true);
    setError(null);
    if (!isSupabaseConfigured()) {
      setSaving(false);
      router.replace("/");
      return;
    }
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Session expired. Please sign in again.");
      setSaving(false);
      return;
    }
    const { error } = await supabase.from("children").insert({
      parent_id: user.id,
      name: child.name.trim(),
      date_of_birth: child.dateOfBirth,
      communication_level: child.communicationLevel,
      diagnosis_status: child.diagnosisStatus,
      current_therapies: child.therapies,
    });
    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  if (step === 1) {
    return (
      <AuthShell
        title="Welcome to ZOE"
        subtitle="Let's get you set up in under a minute."
      >
        <div className="space-y-6">
          <p className="text-sm text-neutral-600">
            We'll ask a few questions about your child so the rest of the app
            works for you. Nothing is shared without your permission.
          </p>
          <Button block onClick={() => setStep(2)}>
            Get started
          </Button>
        </div>
      </AuthShell>
    );
  }

  if (step === 2) {
    return (
      <AuthShell
        title="Tell us about your child"
        subtitle="You can edit any of this later."
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">First name</Label>
            <Input
              id="name"
              value={child.name}
              onChange={(e) => setChild({ ...child, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="dob">Date of birth</Label>
            <Input
              id="dob"
              type="date"
              value={child.dateOfBirth}
              onChange={(e) =>
                setChild({ ...child, dateOfBirth: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Communication level</Label>
            <div className="flex flex-wrap gap-2">
              {COMMUNICATION_LEVELS.map((opt) => (
                <Chip
                  key={opt.value}
                  selected={child.communicationLevel === opt.value}
                  onClick={() =>
                    setChild({ ...child, communicationLevel: opt.value })
                  }
                >
                  {opt.label}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <Label>Diagnosis status</Label>
            <div className="flex flex-wrap gap-2">
              {DIAGNOSIS_STATUSES.map((opt) => (
                <Chip
                  key={opt.value}
                  selected={child.diagnosisStatus === opt.value}
                  onClick={() =>
                    setChild({ ...child, diagnosisStatus: opt.value })
                  }
                >
                  {opt.label}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <Label>Current therapies</Label>
            <div className="flex flex-wrap gap-2">
              {THERAPY_OPTIONS.map((t) => (
                <Chip
                  key={t}
                  selected={child.therapies.includes(t)}
                  onClick={() => toggleTherapy(t)}
                >
                  {t}
                </Chip>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button
            block
            onClick={() => {
              const msg = validateChild();
              if (msg) {
                setError(msg);
                return;
              }
              setError(null);
              setStep(3);
            }}
          >
            Continue
          </Button>
        </div>
      </AuthShell>
    );
  }

  const panel = TUTORIAL[tutorialIndex];
  const Icon = panel.icon;
  const isLast = tutorialIndex === TUTORIAL.length - 1;

  return (
    <AuthShell title="How ZOE works" subtitle={`Step ${tutorialIndex + 1} of 3`}>
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-600">
          <Icon className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">
            {panel.title}
          </h2>
          <p className="mt-2 text-sm text-neutral-600">{panel.body}</p>
        </div>
        <div className="flex justify-center gap-2">
          {TUTORIAL.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-6 rounded-full ${
                i === tutorialIndex ? "bg-primary-500" : "bg-neutral-200"
              }`}
            />
          ))}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button
          block
          disabled={saving}
          onClick={() => {
            if (isLast) {
              finish();
            } else {
              setTutorialIndex(tutorialIndex + 1);
            }
          }}
        >
          {isLast ? (saving ? "Saving…" : "Start using ZOE") : "Next"}
        </Button>
      </div>
    </AuthShell>
  );
}
