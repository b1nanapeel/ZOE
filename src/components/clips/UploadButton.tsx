import Link from "next/link";
import { Plus } from "lucide-react";

export function UploadButton() {
  return (
    <Link
      href="/clips/new"
      aria-label="Add clip"
      className="fixed bottom-24 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-[#0f2035] shadow-lg shadow-primary-500/40 ring-1 ring-primary-300/40 transition hover:bg-primary-600"
    >
      <Plus className="h-6 w-6" />
    </Link>
  );
}
