import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/admin";
import { chunkPaperText } from "@/lib/research-chunking";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  if (!isSupabaseConfigured())
    return NextResponse.json({ error: "Not configured." }, { status: 500 });

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdmin(user))
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart form data." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  const title = String(formData.get("title") ?? "").trim();
  const authors = String(formData.get("authors") ?? "").trim() || null;
  const journal = String(formData.get("journal") ?? "").trim() || null;
  const doi = String(formData.get("doi") ?? "").trim() || null;
  const publishedDate =
    String(formData.get("publishedDate") ?? "").trim() || null;

  if (!(file instanceof File))
    return NextResponse.json({ error: "Missing PDF file." }, { status: 400 });
  if (!title)
    return NextResponse.json({ error: "Title is required." }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());

  let parsed: { text: string };
  try {
    const { PDFParse } = await import("pdf-parse");
    const reader = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await reader.getText();
    parsed = { text: result.text };
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error ? `PDF parse failed: ${e.message}` : "PDF parse failed.",
      },
      { status: 400 },
    );
  }

  const chunks = chunkPaperText(parsed.text);
  if (chunks.length === 0)
    return NextResponse.json(
      { error: "No text could be extracted from this PDF." },
      { status: 400 },
    );

  // Upload PDF to research bucket
  const safeName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-");
  const path = `${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await supabase.storage
    .from("research")
    .upload(path, buffer, {
      contentType: file.type || "application/pdf",
      upsert: false,
    });
  if (uploadError)
    return NextResponse.json(
      { error: `Storage upload failed: ${uploadError.message}` },
      { status: 500 },
    );

  // Insert paper
  const { data: paper, error: paperError } = await supabase
    .from("research_papers")
    .insert({
      title,
      authors,
      journal,
      doi,
      published_date: publishedDate,
      pdf_storage_path: path,
      status: "PENDING",
    })
    .select("id")
    .single();
  if (paperError || !paper) {
    await supabase.storage.from("research").remove([path]);
    return NextResponse.json(
      { error: paperError?.message ?? "Could not create paper." },
      { status: 500 },
    );
  }

  // Insert chunks
  const rows = chunks.map((c) => ({
    paper_id: paper.id,
    content: c.content,
    keywords: c.keywords,
    chunk_index: c.chunkIndex,
    section_type: c.sectionType,
  }));
  const { error: chunksError } = await supabase
    .from("research_chunks")
    .insert(rows);
  if (chunksError) {
    await supabase.from("research_papers").delete().eq("id", paper.id);
    await supabase.storage.from("research").remove([path]);
    return NextResponse.json(
      { error: `Chunk insert failed: ${chunksError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({
    paperId: paper.id,
    chunksCreated: chunks.length,
  });
}
