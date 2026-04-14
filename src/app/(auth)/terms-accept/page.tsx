import Link from "next/link";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";
import { AcceptTermsForm } from "@/components/terms/AcceptTermsForm";

export const dynamic = "force-dynamic";

export default async function TermsAcceptPage() {
  if (!isSupabaseConfigured()) redirect("/login");

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("user_terms_acceptance")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) redirect("/");

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <header className="px-6 pt-8 text-center">
        <span className="text-3xl font-bold tracking-tight text-primary-500">
          ZOE
        </span>
        <p className="mt-2 text-sm text-neutral-500">
          One quick read before we start.
        </p>
      </header>

      <main className="flex-1 mx-auto w-full max-w-lg px-6 py-8">
        <h1 className="text-2xl font-semibold text-neutral-900">
          Here's what ZOE promises you
        </h1>
        <p className="mt-2 text-base text-neutral-600">
          These are the things that matter most for your child. The{" "}
          <Link
            href="/terms"
            className="font-medium text-primary-500 underline"
            target="_blank"
          >
            full terms
          </Link>{" "}
          are always available — but the essentials are right here in plain
          language.
        </p>

        <ul className="mt-6 space-y-3">
          <Bullet>
            ZOE is a documentation tool — a journal that sees patterns. It's
            not a medical device and it doesn't diagnose anything.
          </Bullet>
          <Bullet>
            AI only suggests tags. You review everything. You stay in control
            of what gets saved.
          </Bullet>
          <Bullet>
            Audio and movement analysis happen on your phone or laptop. The
            audio and video frames never leave your device for those.
          </Bullet>
          <Bullet>
            Your data is encrypted and private. Only you — and people you
            invite — can see your child's clips.
          </Bullet>
          <Bullet>
            We never sell your data. Never share with advertisers. Never share
            with insurance or employers.
          </Bullet>
          <Bullet>
            You can opt out of anonymized data used to improve ZOE. No features
            are taken away if you do.
          </Bullet>
          <Bullet>
            You can export everything as JSON, or delete your account and every
            byte of your data, any time.
          </Bullet>
          <Bullet>
            For real medical or therapeutic decisions, talk to qualified
            professionals. ZOE supports you; it doesn't replace them.
          </Bullet>
        </ul>

        <div className="mt-8">
          <AcceptTermsForm />
        </div>
      </main>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 rounded-xl border border-l-4 border-l-primary-500 border-neutral-200 bg-neutral-100 p-3">
      <span
        aria-hidden
        className="mt-0.5 text-lg leading-none text-primary-500"
      >
        ✦
      </span>
      <span className="text-sm text-neutral-800">{children}</span>
    </li>
  );
}
