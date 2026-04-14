import { createServerSupabase } from "./supabase-server";
import { extractKeywords } from "./research-chunking";

export interface ResearchChunkMatch {
  id: string;
  paper_id: string;
  content: string;
  keywords: string[];
  chunk_index: number;
  section_type: string | null;
  paper: {
    id: string;
    title: string;
    authors: string | null;
    journal: string | null;
    doi: string | null;
    published_date: string | null;
  };
}

export interface ResearchInsight {
  chunkId: string;
  paperTitle: string;
  authors: string | null;
  year: string | null;
  doi: string | null;
  chunkContent: string;
  template: string;
}

function buildTsQuery(description: string): string {
  // Build an OR-of-prefixes tsquery from meaningful terms.
  const terms = description
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4)
    .slice(0, 8);
  if (terms.length === 0) return "";
  return [...new Set(terms)].map((t) => `${t}:*`).join(" | ");
}

export async function searchResearch(
  description: string,
  limit = 5,
): Promise<ResearchChunkMatch[]> {
  const tsQuery = buildTsQuery(description);
  const keywordTerms = extractKeywords(description, 6);
  if (!tsQuery && keywordTerms.length === 0) return [];

  const supabase = await createServerSupabase();

  const select =
    "id, paper_id, content, keywords, chunk_index, section_type, paper:research_papers!inner(id, title, authors, journal, doi, published_date, status)";

  const collected = new Map<string, ResearchChunkMatch>();

  if (tsQuery) {
    const { data } = await supabase
      .from("research_chunks")
      .select(select)
      .eq("paper.status", "APPROVED")
      .textSearch("content", tsQuery, { config: "english" })
      .limit(limit * 2);
    (data ?? []).forEach((row: unknown) => {
      const r = row as ResearchChunkMatch;
      if (!collected.has(r.id)) collected.set(r.id, r);
    });
  }

  if (keywordTerms.length > 0) {
    const { data } = await supabase
      .from("research_chunks")
      .select(select)
      .eq("paper.status", "APPROVED")
      .overlaps("keywords", keywordTerms)
      .limit(limit * 2);
    (data ?? []).forEach((row: unknown) => {
      const r = row as ResearchChunkMatch;
      if (!collected.has(r.id)) collected.set(r.id, r);
    });
  }

  // Score: keyword overlap count + small bonus for FTS hit (already in collection).
  const scored = [...collected.values()].map((r) => {
    const overlap = r.keywords.filter((k) =>
      keywordTerms.includes(k.toLowerCase()),
    ).length;
    return { r, score: overlap };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.r);
}

function firstSentences(text: string, n = 2): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  return sentences.slice(0, n).join(" ").trim();
}

function yearOf(published: string | null | undefined): string | null {
  if (!published) return null;
  const m = published.match(/\d{4}/);
  return m ? m[0] : null;
}

export function formatInsight(chunk: ResearchChunkMatch): ResearchInsight {
  const year = yearOf(chunk.paper.published_date);
  const authors = chunk.paper.authors ?? "Unknown authors";
  const snippet = firstSentences(chunk.content, 2);
  const template = `Related research: ${chunk.paper.title} by ${authors}${
    year ? ` (${year})` : ""
  } found that ${snippet}`;

  return {
    chunkId: chunk.id,
    paperTitle: chunk.paper.title,
    authors: chunk.paper.authors,
    year,
    doi: chunk.paper.doi,
    chunkContent: chunk.content,
    template,
  };
}

export function formatInsights(chunks: ResearchChunkMatch[]): ResearchInsight[] {
  return chunks.map(formatInsight);
}
