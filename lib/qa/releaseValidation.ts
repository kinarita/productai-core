import type { PullRequest, ReleaseItem, Task } from "@/types/productai";
import type { Mission } from "@/types/productai";
import { buildMissionReleaseContext } from "@/lib/release/releaseReadiness";
import type { ValidationChecklistView } from "@/lib/qa/validationChecklist";

export interface ReleaseValidationView {
  qaChecklistStatus: string;
  validationCoverage: string[];
  openRisks: string[];
  reviewNotes: string[];
  advisoryNote: string;
}

export function buildReleaseValidation(input: {
  mission: Mission;
  tasks: Task[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
  validationChecklist: ValidationChecklistView;
  qaReadinessLabel: string;
}): ReleaseValidationView {
  const releaseCtx = buildMissionReleaseContext({
    mission: input.mission,
    tasks: input.tasks,
    pullRequests: input.pullRequests,
    releases: input.releases,
  });

  const checklistStatuses = Object.values(input.validationChecklist).map((i) => i.status);
  const completed = checklistStatuses.filter((s) => s === "completed").length;
  const inReview = checklistStatuses.filter((s) => s === "in_review").length;

  const qaChecklistStatus =
    completed >= 5
      ? "QA checklist largely complete (visual confirmation only)."
      : inReview > 0
        ? "QA checklist in review."
        : "QA checklist planned.";

  const coverage = [
    `Readiness: ${input.qaReadinessLabel}`,
    `Release readiness score: ${releaseCtx.row.readinessScore}/100`,
    ...releaseCtx.checklist.slice(0, 4).map((c) => `${c.label}: ${c.status}`),
  ];

  const risks = [
    ...releaseCtx.risks.slice(0, 3).map((r) => r.detail),
    ...(releaseCtx.row.qaStatus.includes("No QA")
      ? ["No QA tasks recorded in release readiness checklist—confirm responsibilities."]
      : []),
  ];

  return {
    qaChecklistStatus,
    validationCoverage: coverage,
    openRisks: risks,
    reviewNotes: [
      "Release Workspace is a visibility layer only—no deploy/release actions are performed.",
      "Any 'ready' label is a recommendation for human release review scheduling, not approval.",
    ],
    advisoryNote:
      "Release validation consumes Release Readiness context for planning. ProductAI does not execute release validation, testing, or deployment.",
  };
}

