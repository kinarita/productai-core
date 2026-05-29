import type { QaReadinessStatusId } from "@/lib/qa/qaWorkspace";
import type { TestPlanRecord } from "@/lib/qa/testPlan";
import type { ValidationChecklistView } from "@/lib/qa/validationChecklist";
import type { AcceptanceCriterionRow } from "@/lib/qa/acceptanceCriteria";
import type { QualityRiskReviewView } from "@/lib/qa/qualityRiskReview";
import type { ReleaseValidationView } from "@/lib/qa/releaseValidation";

export interface QaReadinessArea {
  id: string;
  label: string;
  available: boolean;
  note: string;
}

export interface QaReadinessContext {
  areas: QaReadinessArea[];
  status: QaReadinessStatusId;
  statusLabel: string;
  recommendation: string;
}

const statusLabels: Record<QaReadinessStatusId, string> = {
  not_ready: "Not Ready",
  preparing: "Preparing",
  review_candidate: "Review Candidate",
  ready_for_release_review: "Ready For Release Review",
};

export function buildQaReadinessContext(input: {
  testPlan: TestPlanRecord | null;
  acceptanceCriteria: AcceptanceCriterionRow[];
  checklist: ValidationChecklistView | null;
  riskReview: QualityRiskReviewView | null;
  releaseValidation: ReleaseValidationView | null;
}): QaReadinessContext {
  const areas: QaReadinessArea[] = [
    {
      id: "test_plan",
      label: "Test Plan Available",
      available: Boolean(input.testPlan),
      note: input.testPlan?.title ?? "No test plan record in context.",
    },
    {
      id: "acceptance",
      label: "Acceptance Criteria Defined",
      available: input.acceptanceCriteria.length >= 3,
      note: `${input.acceptanceCriteria.length} criterion rows in view.`,
    },
    {
      id: "checklist",
      label: "Validation Checklist Available",
      available: Boolean(input.checklist),
      note: input.checklist ? "Functional · UX · Integration · Data · Security · Docs" : "Checklist not built.",
    },
    {
      id: "risks",
      label: "Quality Risks Reviewed",
      available: Boolean(input.riskReview),
      note: input.riskReview?.qualityRisks[0] ?? "No risks recorded yet.",
    },
    {
      id: "release_validation",
      label: "Release Validation Prepared",
      available: Boolean(input.releaseValidation),
      note: input.releaseValidation?.qaChecklistStatus ?? "Release validation not prepared.",
    },
    {
      id: "notes",
      label: "Review Notes Available",
      available: Boolean(input.riskReview?.advisoryNote),
      note: input.riskReview?.advisoryNote ?? "No QA notes recorded.",
    },
  ];

  const availableCount = areas.filter((a) => a.available).length;

  let status: QaReadinessStatusId = "not_ready";
  let recommendation =
    "Complete QA planning artifacts (test plan, checklist, acceptance criteria) before release review consideration.";

  if (availableCount <= 2) {
    status = "preparing";
    recommendation =
      "QA planning is in preparation. Keep the scope explicit and avoid any auto-testing or approval language.";
  } else if (availableCount <= 4) {
    status = "review_candidate";
    recommendation =
      "QA artifacts appear sufficient for human QA review scheduling. Recommendation only—no automatic readiness decision.";
  } else {
    status = "ready_for_release_review";
    recommendation =
      "QA readiness appears suitable for release review consideration. Human authorization required—no auto approval or execution.";
  }

  return {
    areas,
    status,
    statusLabel: statusLabels[status],
    recommendation,
  };
}

