import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/admin";

export async function GET(request: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdmin(user))
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const url = new URL(request.url);
  const doi = url.searchParams.get("doi")?.trim();
  if (!doi)
    return NextResponse.json({ error: "Missing DOI." }, { status: 400 });

  try {
    const res = await fetch(
      `https://api.crossref.org/works/${encodeURIComponent(doi)}`,
      {
        headers: {
          "User-Agent":
            "ZOE Research Library (mailto:shakil.musthafa01@gmail.com)",
        },
        cache: "no-store",
      },
    );
    if (!res.ok) {
      return NextResponse.json(
        { valid: false, error: `CrossRef returned ${res.status}` },
        { status: 200 },
      );
    }
    const body = await res.json();
    const w = body?.message ?? {};
    const authors = Array.isArray(w.author)
      ? w.author
          .map((a: { given?: string; family?: string }) =>
            [a.given, a.family].filter(Boolean).join(" "),
          )
          .filter(Boolean)
          .join(", ")
      : null;
    const title = Array.isArray(w.title) ? w.title[0] : null;
    const journal = Array.isArray(w["container-title"])
      ? w["container-title"][0]
      : null;
    const date =
      w.issued?.["date-parts"]?.[0]?.[0]?.toString() ??
      w["published-print"]?.["date-parts"]?.[0]?.[0]?.toString() ??
      null;
    return NextResponse.json({
      valid: true,
      title,
      authors,
      journal,
      publishedDate: date,
    });
  } catch (e) {
    return NextResponse.json(
      {
        valid: false,
        error: e instanceof Error ? e.message : "Lookup failed.",
      },
      { status: 200 },
    );
  }
}
