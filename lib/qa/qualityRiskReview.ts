import type { TechnicalRiskReviewView } from "@/lib/developer/technicalRiskReview";
import type { DevelopmentReviewPreparationView } from "@/lib/developer/reviewPreparation";
import type { ValidationChecklistView } from "@/lib/qa/validationChecklist";

export interface QualityRiskReviewView {
  qualityRisks: string[];
  validationGaps: string[];
  integrationConcerns: string[];
  regressionConcerns: string[];
  openQaQuestions: string[];
  advisoryNote: string;
}

export function buildQualityRiskReview(input: {
  technicalRisks: TechnicalRiskReviewView;
  reviewPreparation: DevelopmentReviewPreparationView;
  validationChecklist: ValidationChecklistView;
}): QualityRiskReviewView {
  const riskFromTech = input.technicalRisks.technicalRisks.slice(0, 3);
  const integration = [
    ...input.technicalRisks.integrationRisks.slice(0, 2),
    ...input.technicalRisks.dependencyRisks.slice(0, 1),
  ];

  const validationGaps = [
    input.validationChecklist.security.notes[0],
    input.validationChecklist.documentation.notes[0],
    "Coverage for cross-workspace deep links should be explicitly validated.",
  ];

  return {
    qualityRisks: [
      ...riskFromTech,
      ...input.technicalRisks.complexityAreas.slice(0, 2),
      "Misleading UI copy about auto-approval or execution risk.",
    ],
    validationGaps,
    integrationConcerns: integration,
    regressionConcerns: [
      "Navigation regressions across CEO Home / Mission Detail / workspaces.",
      "LocalStorage persistence causing stale selected IDs across phases.",
      "Feed label/type mismatches for new QA events.",
    ],
    openQaQuestions: [
      ...input.technicalRisks.openTechnicalQuestions.slice(0, 2),
      input.reviewPreparation.reviewNotes[2] ??
        "Confirm review gating is human decision only (no automation).",
    ],
    advisoryNote:
      "Recommendation only. QA does not auto-judge readiness or perform automated testing inside ProductAI.",
  };
}

