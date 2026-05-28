import type { OrganizationFeedItem } from "@/types/productai";
import type { ProcessingSession } from "@/lib/orchestration/processing/processingTypes";
import { buildProcessingAnalytics } from "@/lib/orchestration/processing/processingAnalytics";
import type { ExecutiveGovernanceSnapshot } from "@/lib/orchestration/governance-history/governanceHistoryTypes";
import type { RuntimeAlert } from "@/lib/store/runtimeStore";
import type { SyncWarning } from "@/lib/store/syncStore";

export function buildExecutiveGovernanceSnapshot(input: {
  processingSessions: ProcessingSession[];
  runtimeAlerts: RuntimeAlert[];
  syncWarnings: SyncWarning[];
  feedItems: OrganizationFeedItem[];
}): ExecutiveGovernanceSnapshot {
  const analytics = buildProcessingAnalytics(input.processingSessions);
  const keyDrivers: string[] = [];
  if (analytics.summary.reviewRequiredCount > 0) {
    keyDrivers.push(`${analytics.summary.reviewRequiredCount} review-required governance session(s).`);
  }
  if (analytics.summary.runtimeInstabilityCount > 0) {
    keyDrivers.push(`${analytics.summary.runtimeInstabilityCount} runtime/provider instability driver(s).`);
  }
  if (input.syncWarnings.length > 0) {
    keyDrivers.push(`${input.syncWarnings.length} sync advisory warning(s).`);
  }
  if (input.runtimeAlerts.length > 0) {
    keyDrivers.push(`${input.runtimeAlerts.length} runtime alert(s) impacting continuity context.`);
  }
  if (!keyDrivers.length) keyDrivers.push("Governance continuity remains operationally stable.");

  const recommendedFocus: string[] = [];
  if (analytics.summary.elevatedRiskCount > 0) {
    recommendedFocus.push("Prioritize elevated and critical review sessions.");
  }
  if (analytics.summary.reviewRequiredCount > 0) {
    recommendedFocus.push("Resolve review-required sessions with human governance decisions.");
  }
  if (!recommendedFocus.length) {
    recommendedFocus.push("Maintain continuity cadence and monitor advisory density.");
  }

  return {
    id: `gov-snapshot-${Date.now()}`,
    createdAt: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    governanceHealthScore: analytics.summary.governanceHealthScore,
    reviewRequiredCount: analytics.summary.reviewRequiredCount,
    elevatedRiskCount: analytics.summary.elevatedRiskCount,
    activeProcessingCount: analytics.summary.activeProcessingCount,
    runtimeInstabilityCount: analytics.summary.runtimeInstabilityCount,
    summary:
      analytics.summary.governanceHealthScore >= 70
        ? "Governance continuity remains operational with moderate advisory review density."
        : "Governance continuity requires focused review due to elevated advisory and review load.",
    keyDrivers,
    recommendedFocus,
  };
}
