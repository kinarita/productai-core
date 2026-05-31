import type { DecisionItem } from "@/lib/discussion/decisionGovernanceTypes";

/** Phase 26.2 — unified decision candidate lifecycle. */
export type DecisionCandidateStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "on_hold"
  | "applied_to_brief";

/** @deprecated Use DecisionCandidateStatus */
export type LegacyCeoDecision = "pending" | "approved" | "rejected" | "needs_discussion";

export function normalizeDecisionStatus(item: DecisionItem): DecisionCandidateStatus {
  if (item.status) return item.status;
  const legacy = item.ceoDecision;
  if (!legacy || legacy === "pending") return "pending";
  if (legacy === "needs_discussion") return "on_hold";
  if (legacy === "approved") return "approved";
  if (legacy === "rejected") return "rejected";
  return "pending";
}

export function countPendingDecisionCandidates(items: DecisionItem[]): number {
  return items.filter((d) => normalizeDecisionStatus(d) === "pending").length;
}

export function canFinalizeArchitectHandoff(items: DecisionItem[]): boolean {
  return countPendingDecisionCandidates(items) === 0;
}

export { pendingDecisionsBannerMessage, pendingDecisionWarningEn as pendingDecisionWarning } from "@/lib/discussion/executiveRoomLabels";

export function isAwaitingCeoDecision(item: DecisionItem): boolean {
  return normalizeDecisionStatus(item) === "pending";
}
