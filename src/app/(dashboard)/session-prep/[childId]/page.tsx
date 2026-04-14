import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SessionPrepSummary as SessionPrepUI } from "@/components/patterns/SessionPrepSummary";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";
import { loadSessionPrep } from "@/lib/session-prep-server";

export default async function SessionPrepPage({
  params,
  searchParams,
}: {
  params: Promise<{ childId: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  if (!isSupabaseConfigured()) notFound();
  const { childId } = await params;
  const sp = await searchParams;

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const to = sp.to ? new Date(sp.to) : new Date();
  const from = sp.from
    ? new Date(sp.from)
    : new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);

  const { summary, childName, authorized } = await loadSessionPrep(
    childId,
    from,
    to,
  );
  if (!authorized || !summary || !childName) notFound();

  return (
    <div className="space-y-5">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4" /> Home
      </Link>
      <header>
        <h1 className="text-2xl font-semibold text-neutral-900">
          Session prep
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Last 7 days for {childName}.
        </p>
      </header>
      <SessionPrepUI childName={childName} summary={summary} />
    </div>
  );
}
