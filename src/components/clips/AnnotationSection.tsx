import { format } from "date-fns";
import { Lock, Stethoscope } from "lucide-react";
import { AddAnnotation } from "./AddAnnotation";

export interface AnnotationRow {
  id: string;
  content: string;
  is_private: boolean;
  created_at: string;
  author_id: string;
  author_name: string;
  author_role: "THERAPIST" | "FAMILY";
}

export function AnnotationSection({
  clipId,
  annotations,
  canAnnotate,
}: {
  clipId: string;
  annotations: AnnotationRow[];
  canAnnotate: boolean;
}) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Care team notes
      </h3>
      <div className="space-y-3">
        {annotations.length === 0 ? (
          <p className="text-sm text-neutral-500">No notes yet.</p>
        ) : (
          <ul className="space-y-2">
            {annotations.map((a) => (
              <li
                key={a.id}
                className="rounded-xl border border-neutral-100 bg-white p-3"
              >
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Stethoscope className="h-3 w-3 text-primary-600" />
                  <span className="font-medium text-neutral-800">
                    {a.author_name}
                  </span>
                  <span>·</span>
                  <span>{format(new Date(a.created_at), "MMM d, h:mm a")}</span>
                  {a.is_private && (
                    <span className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-neutral-100 px-1.5 py-0.5 text-[12px] font-medium text-neutral-600">
                      <Lock className="h-2.5 w-2.5" />
                      Private
                    </span>
                  )}
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-sm text-neutral-800">
                  {a.content}
                </p>
              </li>
            ))}
          </ul>
        )}

        {canAnnotate && <AddAnnotation clipId={clipId} />}
      </div>
    </section>
  );
}
