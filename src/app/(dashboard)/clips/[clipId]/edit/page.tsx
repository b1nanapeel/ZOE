import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { EditClipForm } from "@/components/clips/EditClipForm";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";

export default async function EditClipPage({
  params,
}: {
  params: Promise<{ clipId: string }>;
}) {
  if (!isSupabaseConfigured()) notFound();
  const { clipId } = await params;

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: clip } = await supabase
    .from("clips")
    .select(
      "id, antecedents, antecedent_note, behaviors, behavior_note, consequences, consequence_note, location, time_context, people_present, mood_before, parent_interpretation, parent_feeling",
    )
    .eq("id", clipId)
    .eq("is_deleted", false)
    .maybeSingle();

  if (!clip) notFound();

  return (
    <div className="space-y-5">
      <Link
        href={`/clips/${clipId}`}
        className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4" /> Cancel
      </Link>
      <header>
        <h1 className="text-2xl font-semibold text-neutral-900">Edit clip</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Update tags, context, and your reflection.
        </p>
      </header>
      <EditClipForm
        clipId={clipId}
        initial={{
          antecedents: clip.antecedents ?? [],
          antecedentNote: clip.antecedent_note ?? "",
          behaviors: clip.behaviors ?? [],
          behaviorNote: clip.behavior_note ?? "",
          consequences: clip.consequences ?? [],
          consequenceNote: clip.consequence_note ?? "",
          location: clip.location ?? "",
          timeContext: clip.time_context ?? "",
          peoplePresent: clip.people_present ?? [],
          moodBefore: clip.mood_before ?? "",
          parentInterpretation: clip.parent_interpretation ?? "",
          parentFeeling: clip.parent_feeling ?? "",
        }}
      />
    </div>
  );
}
