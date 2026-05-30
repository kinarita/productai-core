/** Phase 19 — Customer Problem Fit (CPF) artifact. */

import type { EvidenceLevel } from "@/lib/opportunity/opportunityTypes";

export type PainSeverity = "low" | "medium" | "high" | "critical";

export type CpfRecommendation = "proceed" | "validate_more" | "hold";

export interface RankedPainPoint {
  text: string;
  priority: number;
  severity: PainSeverity;
}

export interface CustomerProblemFitReport {
  persona: string[];
  customerJobs: string[];
  painPoints: RankedPainPoint[];
  currentAlternatives: string[];
  alternativeWeaknesses: string[];
  burningNeedScore: number;
  cpfScore: number;
  evidenceLevel: EvidenceLevel;
  recommendation: CpfRecommendation;
}

export interface CpfAuditFields {
  cpfScore: number;
  burningNeedScore: number;
  topPain: string;
  personaSummary: string;
  recommendation: CpfRecommendation;
}

export function cpfAuditFromReport(report: CustomerProblemFitReport): CpfAuditFields {
  const top = report.painPoints.find((p) => p.priority === 1) ?? report.painPoints[0];
  return {
    cpfScore: report.cpfScore,
    burningNeedScore: report.burningNeedScore,
    topPain: top?.text ?? "Customer pain not yet validated",
    personaSummary: report.persona.slice(0, 3).join(" · "),
    recommendation: report.recommendation,
  };
}

export function cpfRecommendationLabel(action: CpfRecommendation): string {
  switch (action) {
    case "proceed":
      return "Proceed";
    case "validate_more":
      return "Validate More";
    case "hold":
      return "Hold";
  }
}

export function painSeverityLabel(severity: PainSeverity): string {
  switch (severity) {
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
    case "critical":
      return "Critical";
  }
}
