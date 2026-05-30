/** Phase 20 — Problem Solution Fit (PSF) artifact. */

export type PsfConfidenceLevel = "low" | "medium" | "high";

export type PsfRecommendation = "proceed" | "validate_more" | "hold";

export interface MvpFeatureScope {
  mustHave: string[];
  shouldHave: string[];
  couldHave: string[];
  wontHave: string[];
}

export interface ProblemSolutionFitReport {
  topProblem: string;
  solutionHypothesis: string;
  expectedOutcome: string;
  validationAssumptions: string[];
  validationRisks: string[];
  validationPlan: string[];
  mvpFeatures: MvpFeatureScope;
  psfScore: number;
  confidenceLevel: PsfConfidenceLevel;
  recommendation: PsfRecommendation;
}

export interface PsfAuditFields {
  psfScore: number;
  solutionHypothesis: string;
  validationRisks: string[];
  validationAssumptions: string[];
  mvpFeatures: string[];
  recommendation: PsfRecommendation;
}

export function psfAuditFromReport(report: ProblemSolutionFitReport): PsfAuditFields {
  return {
    psfScore: report.psfScore,
    solutionHypothesis: report.solutionHypothesis,
    validationRisks: report.validationRisks,
    validationAssumptions: report.validationAssumptions,
    mvpFeatures: report.mvpFeatures.mustHave,
    recommendation: report.recommendation,
  };
}

export function psfRecommendationLabel(action: PsfRecommendation): string {
  switch (action) {
    case "proceed":
      return "Proceed";
    case "validate_more":
      return "Validate More";
    case "hold":
      return "Hold";
  }
}

export function psfConfidenceLabel(level: PsfConfidenceLevel): string {
  switch (level) {
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
  }
}
