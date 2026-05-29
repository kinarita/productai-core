import type { UserFlowRecord } from "@/lib/designer/userFlow";
import type { ScreenInventoryRow } from "@/lib/designer/screenInventory";
import type { UxSpecificationView } from "@/lib/designer/uxSpecification";
import type { DesignSpecificationRecord } from "@/lib/designer/designSpecification";
import type { ComponentInventoryRow } from "@/lib/designer/componentInventory";
import type { DesignReviewStateId } from "@/lib/designer/designerWorkspace";

export interface DesignReadinessArea {
  id: string;
  label: string;
  available: boolean;
  note: string;
}

export interface DesignReviewContext {
  areas: DesignReadinessArea[];
  status: DesignReviewStateId;
  statusLabel: string;
  recommendation: string;
}

const statusLabels: Record<DesignReviewStateId, string> = {
  not_ready: "Not Ready",
  preparing: "Preparing",
  review_candidate: "Review Candidate",
  ready_for_development_planning: "Ready For Development Planning",
};

export function buildDesignReviewContext(input: {
  userFlow: UserFlowRecord;
  screens: ScreenInventoryRow[];
  ux: UxSpecificationView;
  designSpec: DesignSpecificationRecord;
  components: ComponentInventoryRow[];
}): DesignReviewContext {
  const areas: DesignReadinessArea[] = [
    {
      id: "flow",
      label: "User Flow Defined",
      available: input.userFlow.primaryFlow.length > 0,
      note: input.userFlow.title,
    },
    {
      id: "screens",
      label: "Screens Identified",
      available: input.screens.length >= 5,
      note: `${input.screens.length} screens in inventory.`,
    },
    {
      id: "ux",
      label: "UX Goals Defined",
      available: input.ux.userGoals.length > 0,
      note: input.ux.userGoals[0],
    },
    {
      id: "spec",
      label: "Design Specification Available",
      available: !!input.designSpec.title,
      note: input.designSpec.title,
    },
    {
      id: "components",
      label: "Components Identified",
      available: input.components.length >= 5,
      note: `${input.components.length} UI components documented.`,
    },
    {
      id: "a11y",
      label: "Accessibility Reviewed",
      available: input.designSpec.accessibilityGuidelines.length > 0,
      note: "Accessibility guidelines recorded for development planning.",
    },
  ];

  const availableCount = areas.filter((a) => a.available).length;
  let status: DesignReviewStateId = "not_ready";
  let recommendation =
    "Continue UX framing—development planning is not recommended yet.";

  if (availableCount < 2) {
    status = "not_ready";
    recommendation =
      "Technical specification intake required from Architect Workspace first.";
  } else if (availableCount < 4) {
    status = "preparing";
    recommendation =
      "Designer organizes user flows and screens—no auto UI generation.";
  } else if (availableCount < 6) {
    status = "review_candidate";
    recommendation =
      "This mission appears suitable for design review consideration when stakeholders align.";
  } else {
    status = "ready_for_development_planning";
    recommendation =
      "Design artifacts appear ready for development planning consideration—human authorization required; no automatic coding.";
  }

  return {
    areas,
    status,
    statusLabel: statusLabels[status],
    recommendation,
  };
}
