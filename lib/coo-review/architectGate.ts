import type {
  CooReviewReport,
  ExecutiveDecisionStatus,
  ProjectPipelineStage,
} from "@/lib/coo-review/cooReviewTypes";
import { migrateLegacyReviewReport } from "@/lib/coo-review/cooReviewMigration";
import type { PlannerAgentRun, ProductBriefSections } from "@/lib/agents/planner/plannerTypes";
import { getBriefAtVersion } from "@/lib/discussion/briefVersioning";
import type { Mission } from "@/types/productai";

export function getCooReviewReport(
  mission?: Mission,
  run?: PlannerAgentRun
): CooReviewReport | undefined {
  const raw =
    run?.cooReviewReport ??
    mission?.cooReviewReport ??
    run?.ceoReviewReport ??
    mission?.ceoReviewReport;
  return migrateLegacyReviewReport(raw) ?? (raw as CooReviewReport | undefined);
}

export function getExecutiveDecision(
  mission?: Mission,
  run?: PlannerAgentRun
): ExecutiveDecisionStatus | undefined {
  const report = getCooReviewReport(mission, run);
  const decision = run?.executiveDecision ?? mission?.executiveDecision;
  if (decision) return decision;
  if (report) return "awaiting_ceo_approval";
  return undefined;
}

/** Architect runs only after human CEO approval (Phase 21.5). */
export function isArchitectUnlocked(mission?: Mission, run?: PlannerAgentRun): boolean {
  return getExecutiveDecision(mission, run) === "approved";
}

/** Working brief — latest discussion version or current planner output (Phase 22). */
export function getCurrentBrief(
  mission?: Mission,
  run?: PlannerAgentRun
): ProductBriefSections | undefined {
  const versions = run?.briefVersions;
  const version = run?.briefVersion;
  const fromVersion = getBriefAtVersion(versions, version)?.brief;
  return fromVersion ?? run?.brief;
}

/**
 * Brief Architect must consume after CEO approval (Phase 22).
 * Falls back to current brief if approval predates versioning.
 */
export function getLatestApprovedBrief(
  mission?: Mission,
  run?: PlannerAgentRun
): ProductBriefSections | undefined {
  const approvedVersion = run?.latestApprovedBriefVersion ?? mission?.latestApprovedBriefVersion;
  const versions = run?.briefVersions;
  if (approvedVersion && versions?.length) {
    return getBriefAtVersion(versions, approvedVersion)?.brief;
  }
  if (getExecutiveDecision(mission, run) === "approved") {
    return getCurrentBrief(mission, run);
  }
  return undefined;
}

export function getLatestApprovedBriefVersion(
  mission?: Mission,
  run?: PlannerAgentRun
): number | undefined {
  return run?.latestApprovedBriefVersion ?? mission?.latestApprovedBriefVersion;
}

export function architectLockReason(mission?: Mission, run?: PlannerAgentRun): string {
  const report = getCooReviewReport(mission, run);
  const decision = getExecutiveDecision(mission, run);

  if (!report) {
    return "COO Review has not completed — Architect is locked until planning outputs are reviewed.";
  }
  if (!decision || decision === "awaiting_ceo_approval") {
    const rec = report.recommendation;
    return `COO recommends ${rec}. Awaiting your CEO approval before architecture can begin.`;
  }
  switch (decision) {
    case "approved":
      return "CEO approved architecture phase — Architect Agent is unlocked.";
    case "needs_validation":
      return "CEO requested additional validation — return to Planner before architecture.";
    case "hold":
      return "CEO placed this project on hold — Architect is disabled.";
  }
}
