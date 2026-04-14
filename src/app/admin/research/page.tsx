import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";
import { ADMIN_EMAIL, isAdmin } from "@/lib/admin";
import { ToastProvider } from "@/components/ui/toast";
import { UploadResearchForm } from "@/components/admin/UploadResearchForm";
import {
  PaperRow,
  type ChunkRowData,
  type PaperRowData,
} from "@/components/admin/PaperRow";
import { AiAccuracySection } from "@/components/admin/AiAccuracySection";

export const dynamic = "force-dynamic";

export default async function ResearchAdminPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p className="text-sm text-neutral-600">Supabase isn't configured.</p>
      </div>
    );
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isAdmin(user)) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p className="text-base text-neutral-700">
          This area is restricted to {ADMIN_EMAIL}.
        </p>
        <Link href="/" className="mt-4 inline-block text-primary-500 underline">
          Back to ZOE
        </Link>
      </div>
    );
  }

  const { data: papers } = await supabase
    .from("research_papers")
    .select(
      "id, title, authors, journal, doi, published_date, status, uploaded_at, approved_at",
    )
    .order("uploaded_at", { ascending: false });

  const paperIds = (papers ?? []).map((p) => p.id);
  const { data: chunks } = paperIds.length
    ? await supabase
        .from("research_chunks")
        .select("id, paper_id, content, keywords, chunk_index, section_type")
        .in("paper_id", paperIds)
        .order("chunk_index", { ascending: true })
    : { data: [] };

  const chunksByPaper = new Map<string, ChunkRowData[]>();
  ((chunks ?? []) as Array<ChunkRowData & { paper_id: string }>).forEach(
    (c) => {
      const arr = chunksByPaper.get(c.paper_id) ?? [];
      arr.push(c);
      chunksByPaper.set(c.paper_id, arr);
    },
  );

  const all = (papers ?? []) as PaperRowData[];
  const pending = all.filter((p) => p.status === "PENDING");
  const approved = all.filter((p) => p.status === "APPROVED");
  const rejected = all.filter((p) => p.status === "REJECTED");

  return (
    <ToastProvider>
      <div className="mx-auto max-w-3xl p-6 pb-24 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to ZOE
        </Link>

        <header className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500/15 text-primary-500">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              Research library
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Upload PDFs, review chunks, approve to make them searchable in
              ZOE insights.
            </p>
          </div>
        </header>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            AI accuracy
          </h2>
          <AiAccuracySection />
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Add a paper
          </h2>
          <UploadResearchForm />
        </section>

        <PaperSection
          title={`Pending (${pending.length})`}
          empty="No papers waiting for review."
          papers={pending}
          chunksByPaper={chunksByPaper}
          openByDefault
        />
        <PaperSection
          title={`Approved (${approved.length})`}
          empty="No approved papers yet."
          papers={approved}
          chunksByPaper={chunksByPaper}
        />
        <PaperSection
          title={`Rejected (${rejected.length})`}
          empty="No rejected papers."
          papers={rejected}
          chunksByPaper={chunksByPaper}
        />
      </div>
    </ToastProvider>
  );
}

function PaperSection({
  title,
  empty,
  papers,
  chunksByPaper,
  openByDefault = false,
}: {
  title: string;
  empty: string;
  papers: PaperRowData[];
  chunksByPaper: Map<string, ChunkRowData[]>;
  openByDefault?: boolean;
}) {
  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {title}
      </h2>
      {papers.length === 0 ? (
        <p className="text-sm text-neutral-500">{empty}</p>
      ) : (
        <div className="space-y-2">
          {papers.map((p) => (
            <PaperRow
              key={p.id}
              paper={p}
              chunks={chunksByPaper.get(p.id) ?? []}
              initiallyOpen={openByDefault}
            />
          ))}
        </div>
      )}
    </section>
  );
}
