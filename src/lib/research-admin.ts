import { createServerSupabase } from "./supabase-server";

export interface FeedbackRow {
  id: string;
  chunk_id: string | null;
  insight_text: string | null;
  behavioral_context: string | null;
  rating: "UP" | "DOWN";
  feedback_note: string | null;
  user_id: string | null;
  user_role: string | null;
  created_at: string;
}

export interface PaperQuality {
  paperId: string;
  total: number;
  up: number;
  down: number;
  percentPositive: number | null; // null = no feedback
}

export interface FeedbackOverview {
  totalInsights: number;
  totalFeedback: number;
  upCount: number;
  downCount: number;
  percentPositive: number | null;
  recentDownvotes: Array<
    FeedbackRow & {
      paper_title: string | null;
      paper_id: string | null;
      chunk_content: string | null;
    }
  >;
  mostFlaggedPapers: Array<{
    paperId: string;
    title: string;
    flagCount: number;
  }>;
  qualityByPaper: Map<string, PaperQuality>;
}

export async function loadFeedbackOverview(): Promise<FeedbackOverview> {
  const supabase = await createServerSupabase();

  const [{ data: feedback }, { count: totalInsights }] = await Promise.all([
    supabase
      .from("research_feedback")
      .select(
        "id, chunk_id, insight_text, behavioral_context, rating, feedback_note, user_id, user_role, created_at, chunk:research_chunks(content, paper:research_papers(id, title))",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("insight_logs")
      .select("id", { count: "exact", head: true }),
  ]);

  type RawRow = FeedbackRow & {
    chunk:
      | {
          content: string | null;
          paper:
            | { id: string; title: string }
            | { id: string; title: string }[]
            | null;
        }
      | { content: string | null; paper: unknown }[]
      | null;
  };
  const rawRows = (feedback ?? []) as unknown as RawRow[];
  type NormalizedRow = FeedbackRow & {
    chunk: {
      content: string | null;
      paper: { id: string; title: string } | null;
    } | null;
  };
  const rows: NormalizedRow[] = rawRows.map((r) => {
    const chunk = Array.isArray(r.chunk) ? r.chunk[0] : r.chunk;
    if (!chunk) return { ...r, chunk: null } as NormalizedRow;
    const paper = Array.isArray(chunk.paper) ? chunk.paper[0] : chunk.paper;
    return {
      ...r,
      chunk: {
        content: (chunk as { content: string | null }).content ?? null,
        paper: (paper as { id: string; title: string } | null) ?? null,
      },
    } as NormalizedRow;
  });

  const upCount = rows.filter((r) => r.rating === "UP").length;
  const downCount = rows.filter((r) => r.rating === "DOWN").length;
  const totalFeedback = rows.length;
  const percentPositive =
    totalFeedback === 0
      ? null
      : Math.round((upCount / totalFeedback) * 100);

  const qualityByPaper = new Map<string, PaperQuality>();
  rows.forEach((r) => {
    const paperId = r.chunk?.paper?.id;
    if (!paperId) return;
    const q = qualityByPaper.get(paperId) ?? {
      paperId,
      total: 0,
      up: 0,
      down: 0,
      percentPositive: null,
    };
    q.total += 1;
    if (r.rating === "UP") q.up += 1;
    else q.down += 1;
    q.percentPositive = Math.round((q.up / q.total) * 100);
    qualityByPaper.set(paperId, q);
  });

  const flagCounts = new Map<string, { title: string; count: number }>();
  rows
    .filter((r) => r.rating === "DOWN")
    .forEach((r) => {
      const id = r.chunk?.paper?.id;
      const title = r.chunk?.paper?.title;
      if (!id || !title) return;
      const cur = flagCounts.get(id) ?? { title, count: 0 };
      cur.count += 1;
      flagCounts.set(id, cur);
    });

  const mostFlaggedPapers = [...flagCounts.entries()]
    .map(([paperId, v]) => ({ paperId, title: v.title, flagCount: v.count }))
    .sort((a, b) => b.flagCount - a.flagCount)
    .slice(0, 10);

  const recentDownvotes = rows
    .filter((r) => r.rating === "DOWN")
    .slice(0, 25)
    .map((r) => ({
      ...r,
      paper_title: r.chunk?.paper?.title ?? null,
      paper_id: r.chunk?.paper?.id ?? null,
      chunk_content: r.chunk?.content ?? null,
    }));

  return {
    totalInsights: totalInsights ?? 0,
    totalFeedback,
    upCount,
    downCount,
    percentPositive,
    recentDownvotes,
    mostFlaggedPapers,
    qualityByPaper,
  };
}
