import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TeamPanel } from "@/components/team/TeamPanel";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";

export default async function TeamPage() {
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

  const { data: members } = await supabase
    .from("care_team_members")
    .select("id, email, role, status, invited_at, joined_at")
    .eq("child_id", child.id)
    .order("invited_at", { ascending: false });

  return (
    <div className="space-y-5">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4" /> Profile
      </Link>
      <header>
        <h1 className="text-2xl font-semibold text-neutral-900">Care team</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Therapists and family members who can see {child.name}'s clips.
        </p>
      </header>
      <TeamPanel childId={child.id} initialMembers={members ?? []} />
    </div>
  );
}
