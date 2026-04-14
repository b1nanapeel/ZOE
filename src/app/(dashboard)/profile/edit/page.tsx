import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { EditChildForm } from "@/components/profile/EditChildForm";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";

export default async function EditChildPage() {
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
    .select(
      "id, name, date_of_birth, communication_level, diagnosis_status, current_therapies, notes",
    )
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

  return (
    <div className="space-y-5">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4" /> Profile
      </Link>
      <header>
        <h1 className="text-2xl font-semibold text-neutral-900">
          Edit {child.name}
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Update your child's profile.
        </p>
      </header>
      <EditChildForm
        childId={child.id}
        initial={{
          name: child.name,
          dateOfBirth: (child.date_of_birth ?? "").toString().slice(0, 10),
          communicationLevel: child.communication_level,
          diagnosisStatus: child.diagnosis_status,
          currentTherapies: child.current_therapies ?? [],
          notes: child.notes ?? "",
        }}
      />
    </div>
  );
}
