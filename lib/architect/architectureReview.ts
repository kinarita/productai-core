import type { TechnicalSpecificationRecord } from "@/lib/architect/technicalSpecification";
import type { SystemDesignArea } from "@/lib/architect/systemDesign";
import type { ComponentDesignRow } from "@/lib/architect/componentDesign";
import type { DataModelEntity } from "@/lib/architect/dataModel";
import type { ApiDesignRow } from "@/lib/architect/apiDesign";
import type { DependencyDesignView } from "@/lib/architect/dependencyDesign";
import type { ArchitectureReviewStateId } from "@/lib/architect/architectWorkspace";

export interface ArchitectureReadinessArea {
  id: string;
  label: string;
  available: boolean;
  note: string;
}

export interface ArchitectureReviewContext {
  areas: ArchitectureReadinessArea[];
  status: ArchitectureReviewStateId;
  statusLabel: string;
  recommendation: string;
}

const statusLabels: Record<ArchitectureReviewStateId, string> = {
  not_ready: "Not Ready",
  preparing: "Preparing",
  review_candidate: "Review Candidate",
  ready_for_design_review: "Ready For Design Review",
};

export function buildArchitectureReviewContext(input: {
  objective: string;
  specification: TechnicalSpecificationRecord;
  systemDesign: SystemDesignArea[];
  components: ComponentDesignRow[];
  dataModel: DataModelEntity[];
  apiDesign: ApiDesignRow[];
  dependencyDesign: DependencyDesignView;
}): ArchitectureReviewContext {
  const areas: ArchitectureReadinessArea[] = [
    {
      id: "mission",
      label: "Mission Understood",
      available: !!input.objective,
      note: input.objective.slice(0, 100) + (input.objective.length > 100 ? "…" : ""),
    },
    {
      id: "spec",
      label: "Technical Specification Available",
      available: !!input.specification.proposedSolution,
      note: input.specification.title,
    },
    {
      id: "components",
      label: "Components Identified",
      available: input.components.length >= 4,
      note: `${input.components.length} layers documented.`,
    },
    {
      id: "data",
      label: "Data Model Defined",
      available: input.dataModel.length >= 4,
      note: "Entity list available—no ER diagram generation.",
    },
    {
      id: "api",
      label: "API Scope Defined",
      available: input.apiDesign.length >= 3,
      note: "Endpoint scope for planning—no implementation generation.",
    },
    {
      id: "deps",
      label: "Dependencies Reviewed",
      available: input.dependencyDesign.reviewAreas.length > 0,
      note: "Dependency visibility only—no automatic analysis.",
    },
  ];

  const availableCount = areas.filter((a) => a.available).length;
  let status: ArchitectureReviewStateId = "not_ready";
  let recommendation =
    "Continue architecture framing—design review is not recommended yet.";

  if (!input.objective) {
    status = "not_ready";
    recommendation = "Mission intake from Director is required before technical specification.";
  } else if (availableCount < 3) {
    status = "preparing";
    recommendation =
      "Technical specification and system design are in progress—Architect organizes, humans authorize.";
  } else if (availableCount < 6) {
    status = "review_candidate";
    recommendation =
      "This mission appears suitable for architecture review consideration when stakeholders align.";
  } else {
    status = "ready_for_design_review";
    recommendation =
      "Design artifacts are available for human design review—no automatic approval or coding.";
  }

  if (input.specification.openQuestions.length > 2 && status === "ready_for_design_review") {
    status = "review_candidate";
    recommendation =
      "Open questions remain—resolve in Artifact Review before final design sign-off.";
  }

  return {
    areas,
    status,
    statusLabel: statusLabels[status],
    recommendation,
  };
}
