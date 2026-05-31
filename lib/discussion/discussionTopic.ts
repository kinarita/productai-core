import type { DiscussionMessage } from "@/lib/discussion/discussionTypes";
import type { DiscussionPersonaMemory } from "@/lib/discussion/discussionTypes";

const TOPIC_PATTERNS: Array<{ re: RegExp; label: string }> = [
  { re: /音声入力|音声|voice input|voice/i, label: "音声入力機能" },
  { re: /ライブ(動画|カメラ)?/i, label: "ライブカメラ機能" },
  { re: /ライブカメラ/i, label: "ライブカメラ機能" },
  { re: /月次グラフ|グラフ機能|グラフ/i, label: "月次グラフ" },
  { re: /pos|POS連携/i, label: "POS連携" },
  { re: /価格比較/i, label: "価格比較機能" },
];

/** Extract a product topic label from free text (CEO or memory). */
export function extractTopicLabel(message: string): string | null {
  const m = message.trim();
  for (const { re, label } of TOPIC_PATTERNS) {
    if (re.test(m)) return label;
  }
  return null;
}

function topicFromRecentCeoMessages(messages: DiscussionMessage[] | undefined): string | null {
  if (!messages?.length) return null;
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.participant !== "ceo") continue;
    const label = extractTopicLabel(msg.message);
    if (label) return label;
  }
  return null;
}

function resolveTargetSurface(ceoMessage: string): "mvp" | "brief" {
  if (/MVP|mvp/i.test(ceoMessage)) return "mvp";
  return "brief";
}

/**
 * Phase 28.5.1 — Build Decision Candidate title when CEO uses ellipsis
 * ("入れてください", "ブリーフに反映してください", etc.).
 */
export function resolveDecisionCandidateTitle(
  ceoMessage: string,
  opts?: {
    personaMemory?: DiscussionPersonaMemory;
    messages?: DiscussionMessage[];
  }
): string {
  const topic =
    extractTopicLabel(ceoMessage) ??
    opts?.personaMemory?.unresolvedTopics[0] ??
    opts?.personaMemory?.ceoHypotheses[0] ??
    topicFromRecentCeoMessages(opts?.messages);

  const surface = resolveTargetSurface(ceoMessage);

  if (topic) {
    if (surface === "mvp") return `${topic}をMVPに追加する`;
    return `${topic}をProduct Briefに追加する`;
  }

  const trimmed = ceoMessage.trim().slice(0, 72);
  if (surface === "mvp") return trimmed || "MVPへの追加（CEO指示）";
  return trimmed || "Product Briefへの追加（CEO指示）";
}
