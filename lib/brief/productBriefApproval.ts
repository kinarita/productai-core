import type { ProductBriefRecord } from "@/lib/brief/productBriefWorkspace";
import type { ProductBriefStateId } from "@/lib/brief/productBriefStatus";
import { productBriefStateNote } from "@/lib/brief/productBriefStatus";

export interface ProductBriefApprovalContext {
  approvalStatus: string;
  approvalNotes: string[];
  approvalTimeline: Array<{ label: string; at: string; status: string }>;
  directorReadiness: DirectorReadinessView;
}

export interface DirectorReadinessView {
  planningCompleteness: string;
  openQuestions: string;
  reviewStatus: string;
  approvalStatus: string;
  recommendedHandoffReadiness: string;
}

export type CeoBriefActionId = "approve" | "request_changes" | "archive";

export const ceoBriefActions: { id: CeoBriefActionId; label: string; description: string }[] = [
  {
    id: "approve",
    label: "Approve",
    description: "Record CEO approval for continuity—does not auto-create missions or hand off.",
  },
  {
    id: "request_changes",
    label: "Request Changes",
    description: "Request revision visibility—does not auto-reject or modify the brief.",
  },
  {
    id: "archive",
    label: "Archive",
    description: "Archive for continuity reading—does not delete mission data.",
  },
];

export function buildProductBriefApprovalContext(brief: ProductBriefRecord): ProductBriefApprovalContext {
  const approved = brief.status === "approved" || brief.status === "director_handoff_ready";
  const timeline: ProductBriefApprovalContext["approvalTimeline"] = [
    { label: "Draft Created", at: brief.createdAt, status: "completed" },
    {
      label: "Review Requested",
      at: brief.updatedAt,
      status:
        brief.status === "draft" ? "upcoming" : brief.status === "changes_requested" ? "completed" : "completed",
    },
    {
      label: "CEO Approval",
      at: brief.approvedAt ?? "—",
      status: approved ? "completed" : "upcoming",
    },
    {
      label: "Director Handoff Ready",
      at: brief.handoffReady ? brief.updatedAt : "—",
      status: brief.handoffReady ? "completed" : "upcoming",
    },
  ];

  const completeness =
    brief.status === "director_handoff_ready"
      ? "High — approved and handoff-ready"
      : brief.status === "approved"
        ? "Moderate — approved, handoff consideration pending"
        : brief.status === "changes_requested"
          ? "Low — changes requested"
          : "In progress";

  return {
    approvalStatus: approved ? "Approved by CEO" : "Pending CEO authorization",
    approvalNotes: brief.approvalNotes,
    approvalTimeline: timeline,
    directorReadiness: {
      planningCompleteness: completeness,
      openQuestions:
        brief.reviewNotes.length > 0
          ? `${brief.reviewNotes.length} review note(s) on record`
          : "No blocking open questions recorded",
      reviewStatus: brief.reviewStateLabel,
      approvalStatus: brief.approvalStateLabel,
      recommendedHandoffReadiness: brief.handoffReady
        ? "This Product Brief is available for Director handoff consideration."
        : approved
          ? "Brief approved—Director handoff may be considered when stakeholders align."
          : productBriefStateNote(brief.title, brief.status),
    },
  };
}

export function mapApprovalState(status: ProductBriefStateId): string {
  if (status === "approved" || status === "director_handoff_ready") return "Approved";
  if (status === "changes_requested") return "Changes Requested";
  if (status === "review_requested" || status === "under_review") return "Pending Approval";
  return "Not Approved";
}

export function mapReviewState(status: ProductBriefStateId): string {
  if (status === "under_review" || status === "review_requested") return "In Review";
  if (status === "changes_requested") return "Changes Requested";
  if (status === "approved" || status === "director_handoff_ready") return "Review Complete";
  return "Not Started";
}
