import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ClipDetail } from "@/components/clips/ClipDetail";
import { ClipActions } from "@/components/clips/ClipActions";
import {
  AnnotationSection,
  type AnnotationRow,
} from "@/components/clips/AnnotationSection";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";

export default async function ClipDetailPage({
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
      "id, child_id, uploaded_at, recorded_at, duration_seconds, video_url, antecedents, antecedent_note, behaviors, behavior_note, consequences, consequence_note, location, time_context, people_present, mood_before, parent_interpretation, parent_feeling",
    )
    .eq("id", clipId)
    .eq("is_deleted", false)
    .maybeSingle();

  if (!clip) notFound();

  let videoUrl: string | null = null;
  if (clip.video_url) {
    const { data: signed } = await supabase.storage
      .from("clips")
      .createSignedUrl(clip.video_url, 60 * 60);
    videoUrl = signed?.signedUrl ?? null;
  }

  const { data: annotations } = await supabase
    .from("annotations")
    .select(
      "id, content, is_private, created_at, author_id, author_name, author_role",
    )
    .eq("clip_id", clipId)
    .order("created_at", { ascending: false });

  // Can the current user annotate? Must be an active THERAPIST on the team.
  const { data: membership } = await supabase
    .from("care_team_members")
    .select("role, status")
    .eq("child_id", clip.child_id)
    .eq("status", "ACCEPTED")
    .or(`user_id.eq.${user.id},email.eq.${(user.email ?? "").toLowerCase()}`)
    .maybeSingle();
  const canAnnotate = membership?.role === "THERAPIST";

  return (
    <div className="space-y-6">
      <Link
        href="/timeline"
        className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4" /> Timeline
      </Link>
      <ClipDetail clip={clip} videoUrl={videoUrl} />
      <ClipActions clipId={clipId} />
      <AnnotationSection
        clipId={clipId}
        annotations={(annotations ?? []) as AnnotationRow[]}
        canAnnotate={canAnnotate}
      />
    </div>
  );
}
