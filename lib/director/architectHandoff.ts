import type { MissionPlanRecord } from "@/lib/director/missionPlan";
import type { DeliveryPlanView } from "@/lib/director/deliveryPlan";
import type { TaskBreakdownRow } from "@/lib/director/taskBreakdown";
import type { ReviewScheduleItem } from "@/lib/director/reviewSchedule";
import type { ProductBriefRecord } from "@/lib/brief/productBriefWorkspace";
import type { ArchitectHandoffReadinessId } from "@/lib/director/directorWorkspace";

export interface ReadinessArea {
  id: string;
  label: string;
  available: boolean;
  note: string;
}

export interface ArchitectHandoffContext {
  areas: ReadinessArea[];
  status: ArchitectHandoffReadinessId;
  statusLabel: string;
  recommendation: string;
}

export function buildArchitectHandoffContext(input: {
  brief: ProductBriefRecord;
  missionPlan: MissionPlanRecord | null;
  deliveryPlan: DeliveryPlanView | null;
  taskBreakdown: TaskBreakdownRow[];
  reviewSchedule: ReviewScheduleItem[];
}): ArchitectHandoffContext {
  const briefApproved =
    input.brief.status === "approved" || input.brief.status === "director_handoff_ready";

  const areas: ReadinessArea[] = [
    {
      id: "brief",
      label: "Product Brief Approved",
      available: briefApproved,
      note: briefApproved
        ? "CEO authorization recorded."
        : "Brief must be approved before Architect consideration.",
    },
    {
      id: "mission_plan",
      label: "Mission Plan Available",
      available: !!input.missionPlan,
      note: input.missionPlan
        ? input.missionPlan.objective.slice(0, 80) + "…"
        : "Mission Plan not yet visible for this mission.",
    },
    {
      id: "delivery",
      label: "Delivery Plan Available",
      available: !!input.deliveryPlan && input.deliveryPlan.phases.length > 0,
      note: "Delivery phases framed for executive-readable planning.",
    },
    {
      id: "tasks",
      label: "Task Breakdown Available",
      available: input.taskBreakdown.length > 0,
      note:
        input.taskBreakdown.length > 0
          ? `${input.taskBreakdown.length} existing tasks organized—no auto generation.`
          : "No tasks linked yet; breakdown appears when tasks exist.",
    },
    {
      id: "schedule",
      label: "Review Schedule Available",
      available: input.reviewSchedule.length > 0,
      note: "Review cadence visible for planning—no automatic routing.",
    },
  ];

  const availableCount = areas.filter((a) => a.available).length;
  let status: ArchitectHandoffReadinessId = "not_ready";
  let recommendation =
    "Continue Director planning—Architect handoff is not recommended yet.";

  if (!briefApproved) {
    status = "not_ready";
    recommendation =
      "Product Brief requires CEO approval before mission planning proceeds.";
  } else if (availableCount < 3) {
    status = "preparing";
    recommendation =
      "Director planning is in progress. Mission Plan and delivery framing remain open.";
  } else if (availableCount < 5) {
    status = "handoff_candidate";
    recommendation =
      "This mission appears suitable for Architect handoff consideration when stakeholders align.";
  } else {
    status = "ready_for_architect_review";
    recommendation =
      "Planning artifacts are available for Architect review—human authorization required; no automatic handoff.";
  }

  const statusLabel: Record<ArchitectHandoffReadinessId, string> = {
    not_ready: "Not Ready",
    preparing: "Preparing",
    handoff_candidate: "Handoff Candidate",
    ready_for_architect_review: "Ready For Architect Review",
  };

  return {
    areas,
    status,
    statusLabel: statusLabel[status],
    recommendation,
  };
}
