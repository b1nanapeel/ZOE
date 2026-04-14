import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TermsDocument } from "@/components/terms/TermsDocument";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-neutral-50/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <span className="text-xl font-bold tracking-tight text-primary-500">
            ZOE
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-neutral-900">
          Terms &amp; Conditions
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          The short version: ZOE is a journal for your family, not a medical
          device. We don't sell your data. You own your data. We never use it
          for things you didn't explicitly agree to.
        </p>
        <div className="mt-8">
          <TermsDocument />
        </div>
      </main>
    </div>
  );
}
