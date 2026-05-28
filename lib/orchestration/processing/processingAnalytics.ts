import type {
  GovernanceSeverity,
  ProcessingGovernanceReason,
  ProcessingGovernanceSummary,
  ProcessingReasonCategory,
  ProcessingSession,
} from "@/lib/orchestration/processing/processingTypes";

export function getSeverityDistribution(
  sessions: ProcessingSession[]
): Record<GovernanceSeverity, number> {
  const distribution: Record<GovernanceSeverity, number> = {
    low: 0,
    moderate: 0,
    elevated: 0,
    critical_review: 0,
  };
  sessions.forEach((session) => {
    session.activeReasons.forEach((reason) => {
      distribution[reason.severity] += 1;
    });
  });
  return distribution;
}

export function getReasonCategoryDistribution(
  sessions: ProcessingSession[]
): Record<ProcessingReasonCategory, number> {
  const distribution: Record<ProcessingReasonCategory, number> = {
    runtime_stability: 0,
    governance_review: 0,
    dependency_blocker: 0,
    authorization_continuity: 0,
    elevated_risk: 0,
    sync_instability: 0,
    provider_instability: 0,
    execution_boundary_review: 0,
    manual_governance_pause: 0,
    advisory_review: 0,
  };
  sessions.forEach((session) => {
    session.activeReasons.forEach((reason) => {
      distribution[reason.category] += 1;
    });
  });
  return distribution;
}

export function getMissionGovernanceRisk(sessions: ProcessingSession[]): Record<string, number> {
  return sessions.reduce<Record<string, number>>((acc, session) => {
    const score = session.activeReasons.reduce((total, reason) => total + reasonSeverityScore(reason), 0);
    acc[session.missionId] = (acc[session.missionId] ?? 0) + score;
    return acc;
  }, {});
}

function reasonSeverityScore(reason: ProcessingGovernanceReason): number {
  if (reason.severity === "critical_review") return 4;
  if (reason.severity === "elevated") return 3;
  if (reason.severity === "moderate") return 2;
  return 1;
}

export function buildProcessingAnalytics(sessions: ProcessingSession[]): {
  summary: ProcessingGovernanceSummary;
  severityDistribution: Record<GovernanceSeverity, number>;
  categoryDistribution: Record<ProcessingReasonCategory, number>;
  missionRisk: Record<string, number>;
  advisoryOnlyRatio: number;
} {
  const severityDistribution = getSeverityDistribution(sessions);
  const categoryDistribution = getReasonCategoryDistribution(sessions);
  const missionRisk = getMissionGovernanceRisk(sessions);
  const totalReasons = sessions.reduce((sum, s) => sum + s.activeReasons.length, 0);
  const advisoryOnlyCount = sessions.reduce(
    (sum, s) => sum + s.activeReasons.filter((r) => r.advisoryOnly).length,
    0
  );
  const reviewRequiredCount = sessions.filter((s) => s.processingStatus === "processing_review_required").length;
  const runtimeInstabilityCount = sessions.filter((s) =>
    s.activeReasons.some((r) => r.category === "runtime_stability" || r.category === "provider_instability")
  ).length;
  const elevatedRiskCount = sessions.filter((s) =>
    s.activeReasons.some((r) => r.severity === "elevated" || r.severity === "critical_review")
  ).length;
  const activeProcessingCount = sessions.filter((s) => s.processingStatus === "processing_active").length;
  const advisoryDensityPenalty = totalReasons === 0 ? 0 : Math.round((advisoryOnlyCount / totalReasons) * 20);
  const reviewPenalty = Math.min(30, reviewRequiredCount * 8);
  const elevatedPenalty = Math.min(30, elevatedRiskCount * 7);
  const governanceHealthScore = Math.max(0, 100 - advisoryDensityPenalty - reviewPenalty - elevatedPenalty);
  const summary: ProcessingGovernanceSummary = {
    totalProcessingSessions: sessions.length,
    activeProcessingCount,
    reviewRequiredCount,
    elevatedRiskCount,
    runtimeInstabilityCount,
    governanceHealthScore,
    advisoryOnlyCount,
    continuityStable: governanceHealthScore >= 70 && reviewRequiredCount === 0,
  };

  return {
    summary,
    severityDistribution,
    categoryDistribution,
    missionRisk,
    advisoryOnlyRatio: totalReasons === 0 ? 0 : advisoryOnlyCount / totalReasons,
  };
}
