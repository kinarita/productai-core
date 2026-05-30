/** Phase 18 — Opportunity Discovery artifact (hypothesis-based, no web research). */

export type EvidenceLevel = "low" | "medium" | "high";

export type RecommendedAction = "proceed" | "needs_validation" | "hold";

export interface OpportunityBrief {
  opportunitySummary: string;
  targetSegment: string[];
  customerPain: string[];
  currentAlternatives: string[];
  whyExistingSolutionsFail: string[];
  opportunityHypothesis: string;
  evidenceLevel: EvidenceLevel;
  plannerConfidence: number;
  recommendedAction: RecommendedAction;
}

export interface OpportunityAuditFields {
  opportunityScore: number;
  customerPainConfidence: number;
  evidenceLevel: EvidenceLevel;
  recommendedAction: RecommendedAction;
}

export function opportunityAuditFromBrief(brief: OpportunityBrief): OpportunityAuditFields {
  return {
    opportunityScore: brief.plannerConfidence,
    customerPainConfidence: Math.min(
      100,
      Math.max(0, brief.customerPain.length * 18 + (brief.evidenceLevel === "high" ? 25 : brief.evidenceLevel === "medium" ? 12 : 0))
    ),
    evidenceLevel: brief.evidenceLevel,
    recommendedAction: brief.recommendedAction,
  };
}

export function recommendedActionLabel(action: RecommendedAction): string {
  switch (action) {
    case "proceed":
      return "Proceed";
    case "needs_validation":
      return "Needs Validation";
    case "hold":
      return "Hold";
  }
}

export function evidenceLevelLabel(level: EvidenceLevel): string {
  switch (level) {
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
  }
}
