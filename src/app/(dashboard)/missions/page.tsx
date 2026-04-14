import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  MissionCard,
  type MissionData,
} from "@/components/missions/MissionCard";
import { CreateMission } from "@/components/missions/CreateMission";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";

export default async function MissionsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <p className="text-sm text-neutral-600">Supabase isn't configured.</p>
    );
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: child } = await supabase
    .from("children")
    .select("id, name")
    .eq("parent_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!child) {
    return (
      <p className="text-sm text-neutral-600">
        Add a child profile first.{" "}
        <Link href="/onboarding" className="text-primary-600 underline">
          Set one up
        </Link>
        .
      </p>
    );
  }

  const { data: missions } = await supabase
    .from("observation_missions")
    .select(
      "id, prompt, status, due_date, assigned_by_id, assigned_by_name, created_at, completed_at",
    )
    .eq("child_id", child.id)
    .order("created_at", { ascending: false });

  // Is the current user a therapist on this child's care team?
  const { data: membership } = await supabase
    .from("care_team_members")
    .select("role")
    .eq("child_id", child.id)
    .eq("status", "ACCEPTED")
    .or(`user_id.eq.${user.id},email.eq.${(user.email ?? "").toLowerCase()}`)
    .maybeSingle();
  const isTherapist = membership?.role === "THERAPIST";
  const isParent = true; // owns child

  const all = (missions ?? []) as MissionData[];
  const active = all.filter((m) => m.status === "ACTIVE");
  const past = all.filter((m) => m.status !== "ACTIVE");

  return (
    <div className="space-y-5">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4" /> Home
      </Link>
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Missions</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Things {child.name}'s therapist wants you to capture.
          </p>
        </div>
        {isTherapist && <CreateMission childId={child.id} />}
      </header>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Active
        </h3>
        {active.length === 0 ? (
          <p className="text-sm text-neutral-500">No active missions.</p>
        ) : (
          <ul className="space-y-2">
            {active.map((m) => (
              <li key={m.id}>
                <MissionCard
                  mission={m}
                  showRecordCta
                  canComplete={isParent}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Past
          </h3>
          <ul className="space-y-2">
            {past.map((m) => (
              <li key={m.id}>
                <MissionCard mission={m} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
