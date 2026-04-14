import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { UploadFlow } from "@/components/clips/UploadFlow";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";

export default async function NewClipPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="text-sm text-neutral-600">
        Supabase isn't configured. Add credentials to <code>.env.local</code> to
        record clips.
      </div>
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
      <div className="space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-neutral-600"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
        <p className="text-neutral-700">
          Add a child profile first, then come back to record clips.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4" /> Cancel
      </Link>
      <UploadFlow childId={child.id} childName={child.name} />
    </div>
  );
}
