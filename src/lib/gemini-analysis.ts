import {
  ANTECEDENT_TAGS,
  BEHAVIOR_TAGS,
  CONSEQUENCE_TAGS,
  MOOD_TAGS,
} from "./constants";
import { markMinuteFull } from "./gemini-rate-limiter";

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const TIMEOUT_MS = 30_000;

const ALL_BEHAVIORS: string[] = (
  Object.values(BEHAVIOR_TAGS) as ReadonlyArray<readonly string[]>
).flatMap((arr) => [...arr]);

const PROMPT = `You are analyzing a short video clip of a child for behavioral documentation purposes. Observe and describe:
1) Any communication behaviors (vocalizations, gestures, eye contact, words, AAC use, echolalia).
2) Any movement patterns (hand flapping, rocking, spinning, toe walking, reaching, withdrawing).
3) Any emotional expressions (smiling, crying, calm, distressed, meltdown, shutdown).
4) Any sensory behaviors (covering ears, touching textures, avoiding touch, seeking pressure, staring at objects).
5) What appeared to happen right before (antecedent).
6) What happened after (consequence).

Return your response as JSON with these fields:
- suggestedBehaviors: array of strings, each MUST exactly match one of: ${ALL_BEHAVIORS.map((b) => `"${b}"`).join(", ")}
- suggestedAntecedents: array of strings, each MUST exactly match one of: ${ANTECEDENT_TAGS.map((t) => `"${t}"`).join(", ")}
- suggestedConsequences: array of strings, each MUST exactly match one of: ${CONSEQUENCE_TAGS.map((t) => `"${t}"`).join(", ")}
- suggestedMood: a single string, one of: ${MOOD_TAGS.map((t) => `"${t}"`).join(", ")}
- confidence: number 0-1
- narrativeObservation: a 2-3 sentence plain English description of what you observed.

Only include behaviors you can clearly observe. If the video is unclear, set confidence low and include fewer suggestions.`;

export interface GeminiSuggestions {
  suggestedBehaviors: string[];
  suggestedAntecedents: string[];
  suggestedConsequences: string[];
  suggestedMood: string | null;
  confidence: number;
  narrativeObservation: string;
}

function intersect(a: string[], allowed: readonly string[]): string[] {
  const set = new Set(allowed);
  return [...new Set(a.filter((x) => typeof x === "string" && set.has(x)))];
}

async function detectMimeType(
  videoUrl: string,
  signal: AbortSignal,
): Promise<string> {
  try {
    const res = await fetch(videoUrl, { method: "HEAD", signal });
    const ct = res.headers.get("content-type");
    if (ct && ct.startsWith("video/")) return ct.split(";")[0].trim();
  } catch {
    // fall through to default
  }
  return "video/mp4";
}

function parseJsonText(text: string): Record<string, unknown> | null {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

export async function analyzeVideoWithGemini(
  videoUrl: string,
): Promise<GeminiSuggestions | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const mimeType = await detectMimeType(videoUrl, controller.signal);

    const body = {
      contents: [
        {
          role: "user",
          parts: [
            { text: PROMPT },
            { fileData: { fileUri: videoUrl, mimeType } },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    };

    const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      if (res.status === 429) markMinuteFull();
      console.warn(`[gemini] API returned ${res.status}`);
      return null;
    }

    const json = (await res.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!text) return null;
    const parsed = parseJsonText(text);
    if (!parsed) return null;

    const behaviors = Array.isArray(parsed.suggestedBehaviors)
      ? intersect(parsed.suggestedBehaviors as string[], ALL_BEHAVIORS)
      : [];
    const antecedents = Array.isArray(parsed.suggestedAntecedents)
      ? intersect(parsed.suggestedAntecedents as string[], ANTECEDENT_TAGS)
      : [];
    const consequences = Array.isArray(parsed.suggestedConsequences)
      ? intersect(parsed.suggestedConsequences as string[], CONSEQUENCE_TAGS)
      : [];
    const mood =
      typeof parsed.suggestedMood === "string" &&
      (MOOD_TAGS as readonly string[]).includes(parsed.suggestedMood)
        ? (parsed.suggestedMood as string)
        : null;
    const confidence =
      typeof parsed.confidence === "number"
        ? Math.max(0, Math.min(1, parsed.confidence))
        : 0.5;
    const narrative =
      typeof parsed.narrativeObservation === "string"
        ? parsed.narrativeObservation.trim()
        : "";

    return {
      suggestedBehaviors: behaviors,
      suggestedAntecedents: antecedents,
      suggestedConsequences: consequences,
      suggestedMood: mood,
      confidence,
      narrativeObservation: narrative,
    };
  } catch (e) {
    console.warn(
      "[gemini] analysis failed:",
      e instanceof Error ? e.message : e,
    );
    return null;
  } finally {
    clearTimeout(timer);
  }
}
