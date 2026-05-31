/** Phase 26.3 — unified executive room role labels. */

export const PRODUCT_PLANNER_DISPLAY_NAME = "Product Planner";

export const PRODUCT_PLANNER_EMOJI = "🧠";

export function pendingDecisionsBannerMessage(count: number): string | null {
  if (count <= 0) return null;
  return `⚠ まだ ${count} 件の判断待ちがあります。採用・保留・却下を選択してください。`;
}

/** CEO Decision card / architect gate (English, executive-facing). */
export function pendingDecisionWarningEn(count: number): string | null {
  if (count <= 0) return null;
  const noun = count === 1 ? "decision remains" : "decisions remain";
  return `${count} pending ${noun}. Please approve, reject, or put them on hold before architect handoff.`;
}

export function architectHandoffBlockedTitle(): string {
  return "Architecture handoff blocked.";
}

export function architectHandoffBlockedDetail(count: number): string {
  const noun = count === 1 ? "decision remains" : "decisions remain";
  return `${count} pending ${noun}. Resolve each decision candidate (採用 / 保留 / 却下) before final handoff.`;
}
