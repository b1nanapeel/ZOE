// Plain TypeScript: PDF text → token-aware chunks → keyword lists.

const STOP_WORDS = new Set([
  "the","a","an","and","or","but","if","then","else","for","of","to","in","on","at","by","with","from","as","is","are","was","were","be","been","being","this","that","these","those","it","its","we","our","their","they","he","she","his","her","you","your","i","my","me","not","no","yes","do","does","did","done","have","has","had","can","could","should","would","may","might","must","will","shall","also","such","than","there","here","when","where","which","who","whom","whose","what","why","how","into","over","under","about","between","through","during","before","after","above","below","up","down","out","off","again","further","more","most","other","some","any","all","each","few","both","very","just","only","so","because","while","until","upon","across","without","within","per","via","et","al","using","based","study","studies","research","results","method","methods","analysis","data","et al","figure","table","one","two","three","first","second","third","however","thus","therefore","whether","among"
]);

export interface PaperChunk {
  content: string;
  keywords: string[];
  chunkIndex: number;
  sectionType: string | null;
}

const SECTION_HINTS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /^abstract\b/i, label: "abstract" },
  { pattern: /^introduction\b/i, label: "introduction" },
  { pattern: /^background\b/i, label: "background" },
  { pattern: /^method(s|ology)?\b/i, label: "methods" },
  { pattern: /^result(s)?\b/i, label: "results" },
  { pattern: /^discussion\b/i, label: "discussion" },
  { pattern: /^conclusion(s)?\b/i, label: "conclusion" },
  { pattern: /^references?\b/i, label: "references" },
  { pattern: /^limitations?\b/i, label: "limitations" },
];

const TARGET_TOKENS = 500;

function approxTokens(text: string) {
  // Conservative: ~1.3 tokens per word.
  return Math.ceil(text.split(/\s+/).filter(Boolean).length * 1.3);
}

function detectSection(paragraph: string): string | null {
  const head = paragraph.split("\n", 1)[0]?.trim() ?? "";
  for (const hint of SECTION_HINTS) {
    if (hint.pattern.test(head)) return hint.label;
  }
  return null;
}

function cleanText(raw: string) {
  return raw
    .replace(/\r/g, "")
    .replace(/-\n(\w)/g, "$1") // un-hyphenate line breaks
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function chunkPaperText(rawText: string): PaperChunk[] {
  const text = cleanText(rawText);
  if (!text) return [];

  const paragraphs = text
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 30); // skip noise / page numbers

  const chunks: PaperChunk[] = [];
  let buffer: string[] = [];
  let bufferTokens = 0;
  let bufferSection: string | null = null;
  let chunkIndex = 0;

  function flush() {
    if (buffer.length === 0) return;
    const content = buffer.join("\n\n").trim();
    if (content.length === 0) return;
    chunks.push({
      content,
      keywords: extractKeywords(content),
      chunkIndex: chunkIndex++,
      sectionType: bufferSection,
    });
    buffer = [];
    bufferTokens = 0;
    bufferSection = null;
  }

  for (const para of paragraphs) {
    const detected = detectSection(para);
    if (detected) bufferSection = detected;

    const paraTokens = approxTokens(para);

    // Single huge paragraph: split on sentences.
    if (paraTokens > TARGET_TOKENS) {
      flush();
      const sentences = para.match(/[^.!?]+[.!?]+/g) ?? [para];
      let local: string[] = [];
      let localTokens = 0;
      for (const s of sentences) {
        const t = approxTokens(s);
        if (localTokens + t > TARGET_TOKENS && local.length) {
          buffer.push(local.join(" ").trim());
          flush();
          local = [];
          localTokens = 0;
        }
        local.push(s.trim());
        localTokens += t;
      }
      if (local.length) {
        buffer.push(local.join(" ").trim());
        flush();
      }
      continue;
    }

    if (bufferTokens + paraTokens > TARGET_TOKENS && buffer.length) {
      flush();
    }
    buffer.push(para);
    bufferTokens += paraTokens;
  }
  flush();

  return chunks;
}

export function extractKeywords(text: string, max = 8): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 4 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));

  const counts = new Map<string, number>();
  for (const w of words) counts.set(w, (counts.get(w) ?? 0) + 1);

  return [...counts.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, max)
    .map(([w]) => w);
}
