import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Users,
  User as UserIcon,
  ChevronRight,
  Pencil,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";
import { userDisplayName } from "@/lib/auth-helpers";
import { SignOutButton } from "@/components/profile/SignOutButton";
import {
  ExportButton,
  DeleteAccountButton,
} from "@/components/profile/AccountActions";

export default async function ProfilePage() {
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
    .select("id, name, date_of_birth, communication_level, diagnosis_status")
    .eq("parent_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { count: teamCount } = child
    ? await supabase
        .from("care_team_members")
        .select("id", { count: "exact", head: true })
        .eq("child_id", child.id)
    : { count: 0 };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-neutral-900">Profile</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Signed in as {userDisplayName(user)} · {user.email}
        </p>
      </header>

      {child ? (
        <Card>
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
              <UserIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-neutral-900">
                {child.name}
              </p>
              <p className="text-sm text-neutral-500">
                {child.communication_level.replaceAll("_", " ").toLowerCase()} ·{" "}
                {child.diagnosis_status.replaceAll("_", " ").toLowerCase()}
              </p>
            </div>
            <Link
              href="/profile/edit"
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50"
            >
              <Pencil className="h-3 w-3" /> Edit
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="text-sm text-neutral-600">
          No child profile yet.{" "}
          <Link href="/onboarding" className="text-primary-600 underline">
            Set one up
          </Link>
          .
        </Card>
      )}

      <nav className="space-y-2">
        <ProfileLink
          href="/team"
          icon={<Users className="h-5 w-5" />}
          title="Care team"
          subtitle={
            teamCount && teamCount > 0
              ? `${teamCount} member${teamCount === 1 ? "" : "s"}`
              : "No members yet"
          }
        />
      </nav>

      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Your data
        </h3>
        <ExportButton />
      </section>

      <SignOutButton />

      <section className="space-y-2 pt-6">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Danger zone
        </h3>
        <DeleteAccountButton />
        <p className="text-xs text-neutral-500">
          This permanently removes your account, every clip, and all care-team
          records. There's no undo.
        </p>
      </section>
    </div>
  );
}

function ProfileLink({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-neutral-900">{title}</p>
        <p className="text-xs text-neutral-500">{subtitle}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-neutral-400" />
    </Link>
  );
}
