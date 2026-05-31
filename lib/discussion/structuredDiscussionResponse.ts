/** Phase 24.5 — Summary + expandable detail for Discovery Discussion. */

export interface StructuredDiscussionResponse {
  summary: string;
  detail: string;
  /** Phase 28.5 Stage 1 — may lead to product decision */
  discussionSignal?: boolean;
  /** Phase 28 Stage 2 — formal candidate */
  suggestsDecisionCandidate?: boolean;
}

const SUMMARY_MARKERS = [/^\s*SUMMARY\s*:?\s*/im, /^\s*要約\s*:?\s*/im];
const DETAIL_MARKERS = [/^\s*DETAIL\s*:?\s*/im, /^\s*詳細\s*:?\s*/im, /^\s*詳細分析\s*:?\s*/im];

export function parseStructuredDiscussionResponse(raw: string): StructuredDiscussionResponse {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { summary: "", detail: "" };
  }

  try {
    const parsed = JSON.parse(trimmed) as {
      summary?: string;
      detail?: string;
      discussionSignal?: boolean;
      suggestsDecisionCandidate?: boolean;
    };
    if (typeof parsed.summary === "string") {
      return {
        summary: parsed.summary.trim(),
        detail: (parsed.detail ?? "").trim(),
        discussionSignal: parsed.discussionSignal === true,
        suggestsDecisionCandidate: parsed.suggestsDecisionCandidate === true,
      };
    }
  } catch {
    /* plain text or markdown */
  }

  for (const marker of DETAIL_MARKERS) {
    const match = trimmed.match(marker);
    if (match?.index != null && match.index >= 0) {
      const before = trimmed.slice(0, match.index).replace(SUMMARY_MARKERS[0], "").trim();
      const after = trimmed.slice(match.index + match[0].length).trim();
      const summaryPart = before.replace(/^\s*SUMMARY\s*:?\s*/im, "").trim();
      return {
        summary: summaryPart || after.slice(0, 280),
        detail: after,
      };
    }
  }

  const paragraphs = trimmed.split(/\n\n+/).filter(Boolean);
  if (paragraphs.length <= 2) {
    return { summary: trimmed, detail: "" };
  }

  return {
    summary: paragraphs.slice(0, 2).join("\n\n"),
    detail: paragraphs.slice(2).join("\n\n"),
  };
}

export function toDiscussionMessageBody(structured: StructuredDiscussionResponse): string {
  return structured.summary;
}
