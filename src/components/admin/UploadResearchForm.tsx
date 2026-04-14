"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

interface DoiState {
  status: "idle" | "checking" | "valid" | "invalid";
  message?: string;
}

export function UploadResearchForm() {
  const router = useRouter();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [journal, setJournal] = useState("");
  const [doi, setDoi] = useState("");
  const [publishedDate, setPublishedDate] = useState("");
  const [doiState, setDoiState] = useState<DoiState>({ status: "idle" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced DOI lookup
  useEffect(() => {
    const trimmed = doi.trim();
    if (!trimmed) {
      setDoiState({ status: "idle" });
      return;
    }
    setDoiState({ status: "checking" });
    const handle = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/admin/research/crossref?doi=${encodeURIComponent(trimmed)}`,
        );
        const body = await res.json();
        if (!body.valid) {
          setDoiState({
            status: "invalid",
            message: body.error ?? "Not found in CrossRef",
          });
          return;
        }
        setDoiState({ status: "valid", message: "Found in CrossRef" });
        if (body.title && !title) setTitle(body.title);
        if (body.authors && !authors) setAuthors(body.authors);
        if (body.journal && !journal) setJournal(body.journal);
        if (body.publishedDate && !publishedDate)
          setPublishedDate(body.publishedDate);
      } catch {
        setDoiState({ status: "invalid", message: "Lookup failed" });
      }
    }, 600);
    return () => window.clearTimeout(handle);
    // Title/authors/etc only fill on first valid response — depend on doi only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doi]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError("Pick a PDF.");
      return;
    }
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", title);
      fd.append("authors", authors);
      fd.append("journal", journal);
      fd.append("doi", doi);
      fd.append("publishedDate", publishedDate);

      const res = await fetch("/api/admin/research/upload", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Upload failed.");
      }
      const body = (await res.json()) as { chunksCreated: number };
      toast({
        title: "Paper uploaded",
        description: `Created ${body.chunksCreated} chunks. Review and approve below.`,
      });
      setFile(null);
      setTitle("");
      setAuthors("");
      setJournal("");
      setDoi("");
      setPublishedDate("");
      setDoiState({ status: "idle" });
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed.";
      setError(msg);
      toast({ title: "Upload failed", description: msg, variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-xl border border-neutral-200 bg-neutral-100 p-4 space-y-4"
    >
      <div>
        <Label htmlFor="paper-file">PDF</Label>
        <input
          ref={fileRef}
          id="paper-file"
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-base text-neutral-700 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-500 file:px-3 file:py-2 file:text-base file:font-medium file:text-[#0f2035] hover:file:bg-primary-600"
        />
        {file && (
          <p className="mt-1 font-mono text-xs text-neutral-500">
            {file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="paper-doi">DOI</Label>
        <div className="relative">
          <Input
            id="paper-doi"
            value={doi}
            onChange={(e) => setDoi(e.target.value)}
            placeholder="10.1037/example.2024"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {doiState.status === "checking" && (
              <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
            )}
            {doiState.status === "valid" && (
              <CheckCircle2 className="h-4 w-4 text-primary-500" />
            )}
            {doiState.status === "invalid" && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        </div>
        {doiState.message && (
          <p
            className={`mt-1 text-xs ${
              doiState.status === "valid"
                ? "text-primary-500"
                : doiState.status === "invalid"
                  ? "text-red-500"
                  : "text-neutral-500"
            }`}
          >
            {doiState.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="paper-title">Title</Label>
        <Input
          id="paper-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="paper-authors">Authors</Label>
        <Input
          id="paper-authors"
          value={authors}
          onChange={(e) => setAuthors(e.target.value)}
          placeholder="Lastname, F.; Lastname, F."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="paper-journal">Journal</Label>
          <Input
            id="paper-journal"
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="paper-date">Published</Label>
          <Input
            id="paper-date"
            value={publishedDate}
            onChange={(e) => setPublishedDate(e.target.value)}
            placeholder="2024 or 2024-03"
          />
        </div>
      </div>

      {error && <FieldError>{error}</FieldError>}

      <Button type="submit" block disabled={submitting}>
        <Upload className="h-4 w-4" />
        {submitting ? "Uploading & extracting…" : "Upload paper"}
      </Button>
      <p className="text-xs text-neutral-500">
        Text is extracted with pdf-parse and split into ~500-token chunks.
        Keywords are auto-generated. Paper starts as PENDING for review.
      </p>
    </form>
  );
}
