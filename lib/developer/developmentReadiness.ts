import type { ImplementationPlanRecord } from "@/lib/developer/implementationPlan";
import type { DevelopmentWorkItem } from "@/lib/developer/workBreakdown";
import type { RepositoryPlanView } from "@/lib/developer/repositoryPlan";
import type { TechnicalRiskReviewView } from "@/lib/developer/technicalRiskReview";
import type { DevelopmentReadinessStateId } from "@/lib/developer/developerWorkspace";

export interface DevelopmentReadinessArea {
  id: string;
  label: string;
  available: boolean;
  note: string;
}

export interface DevelopmentReadinessContext {
  areas: DevelopmentReadinessArea[];
  status: DevelopmentReadinessStateId;
  statusLabel: string;
  recommendation: string;
}

const statusLabels: Record<DevelopmentReadinessStateId, string> = {
  not_ready: "Not Ready",
  preparing: "Preparing",
  review_candidate: "Review Candidate",
  ready_for_qa_planning: "Ready For QA Planning",
};

export function buildDevelopmentReadinessContext(input: {
  hasTechnicalSpec: boolean;
  hasDesignSpec: boolean;
  componentCount: number;
  workBreakdown: DevelopmentWorkItem[];
  repositoryPlan: RepositoryPlanView;
  risks: TechnicalRiskReviewView;
}): DevelopmentReadinessContext {
  const areas: DevelopmentReadinessArea[] = [
    {
      id: "tech_spec",
      label: "Technical Specification Available",
      available: input.hasTechnicalSpec,
      note: "From Architect Workspace.",
    },
    {
      id: "design_spec",
      label: "Design Specification Available",
      available: input.hasDesignSpec,
      note: "From Designer Workspace.",
    },
    {
      id: "components",
      label: "Components Identified",
      available: input.componentCount >= 5,
      note: `${input.componentCount} components in design inventory.`,
    },
    {
      id: "work",
      label: "Work Breakdown Available",
      available: input.workBreakdown.length > 0,
      note: `${input.workBreakdown.length} items—existing tasks organized only.`,
    },
    {
      id: "repo",
      label: "Repository Plan Available",
      available: input.repositoryPlan.repositoryStructure.length > 0,
      note: "Repository design only—no execution.",
    },
    {
      id: "risks",
      label: "Risks Reviewed",
      available: input.risks.technicalRisks.length > 0,
      note: "Recommendation only—no automatic risk scoring.",
    },
  ];

  const availableCount = areas.filter((a) => a.available).length;
  let status: DevelopmentReadinessStateId = "not_ready";
  let recommendation =
    "Continue implementation planning—QA planning is not recommended yet.";

  if (!input.hasTechnicalSpec || !input.hasDesignSpec) {
    status = "not_ready";
    recommendation =
      "Complete Architect and Designer workspaces before development planning.";
  } else if (availableCount < 3) {
    status = "preparing";
    recommendation =
      "Developer organizes implementation plan and work breakdown—no auto coding.";
  } else if (availableCount < 6) {
    status = "review_candidate";
    recommendation =
      "This mission appears suitable for development review consideration when stakeholders align.";
  } else {
    status = "ready_for_qa_planning";
    recommendation =
      "Implementation planning artifacts appear ready for QA planning consideration—human authorization required; no automatic execution.";
  }

  return {
    areas,
    status,
    statusLabel: statusLabels[status],
    recommendation,
  };
}
