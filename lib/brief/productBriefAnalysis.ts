import type { Mission } from "@/types/productai";
import type { ProductIdea, IdeaStateId } from "@/lib/idea/ideaWorkspace";
import { buildProductIdeas } from "@/lib/idea/ideaAnalysis";
import { buildProductBrief } from "@/lib/idea/productBrief";
import type { ProductBriefRecord } from "@/lib/brief/productBriefWorkspace";
import {
  briefIdFromMission,
  productBriefWorkspaceAdvisoryNote,
} from "@/lib/brief/productBriefWorkspace";
import type { ProductBriefStateId } from "@/lib/brief/productBriefStatus";
import {
  productBriefStateLabel,
  productBriefStateNote,
} from "@/lib/brief/productBriefStatus";
import { mapApprovalState, mapReviewState } from "@/lib/brief/productBriefApproval";
import { buildProductBriefReviewContext } from "@/lib/brief/productBriefReview";
import { buildProductBriefApprovalContext } from "@/lib/brief/productBriefApproval";

export interface ProductBriefBoardRow {
  title: string;
  status: string;
  statusId: ProductBriefStateId;
  planner: string;
  reviewState: string;
  approvalState: string;
  directorReadiness: string;
  lastUpdated: string;
  briefId: string;
  missionId: string | null;
}

export interface ProductBriefHistoryStep {
  id: string;
  label: string;
  status: "completed" | "current" | "upcoming";
  detail: string;
}

export interface ProductBriefOverviewSummary {
  draftBriefs: number;
  underReview: number;
  approvedBriefs: number;
  directorReadyBriefs: number;
  advisoryNote: string;
}

export interface PlannerBriefView {
  activeBriefs: ProductBriefRecord[];
  reviewRequests: ProductBriefRecord[];
  pendingQuestions: ProductBriefRecord[];
  approvedBriefs: ProductBriefRecord[];
  advisoryNote: string;
}

export interface DirectorBriefView {
  handoffReadyBriefs: ProductBriefRecord[];
  approvedBriefs: ProductBriefRecord[];
  planningQueue: ProductBriefRecord[];
  advisoryNote: string;
}

function ideaStatusToBriefStatus(ideaStatus: IdeaStateId, mission: Mission): ProductBriefStateId {
  if (mission.status === "completed") return "archived";
  switch (ideaStatus) {
    case "captured":
    case "exploring":
    case "refining":
    case "product_brief_draft":
      return "draft";
    case "ready_for_review":
      return mission.progress >= 50 ? "review_requested" : "under_review";
    case "approved":
      return mission.progress >= 70 ? "director_handoff_ready" : "approved";
    case "archived":
      return "archived";
    default:
      return "draft";
  }
}

export function buildProductBriefRecord(input: {
  idea: ProductIdea;
  mission: Mission | null;
}): ProductBriefRecord {
  const { idea, mission } = input;
  const missionId = idea.relatedMissionId ?? null;
  const status = mission
    ? ideaStatusToBriefStatus(idea.status, mission)
    : idea.status === "approved"
      ? "approved"
      : idea.status === "ready_for_review"
        ? "review_requested"
        : "draft";

  const doc = buildProductBrief(idea);
  const handoffReady = status === "director_handoff_ready";
  const approved = status === "approved" || handoffReady;

  const plannerNotes = [
    "Product Planner organized idea framing into brief sections—no autonomous strategy.",
    ...doc.featureCandidates.slice(0, 2),
  ];

  const reviewNotes = doc.reviewNotes;
  const approvalNotes: string[] = [];
  if (approved) {
    approvalNotes.push("CEO authorization recorded for continuity reading.");
  }
  if (handoffReady) {
    approvalNotes.push("Director may consider mission planning when stakeholders align.");
  }

  return {
    briefId: missionId ? briefIdFromMission(missionId) : `brief-${idea.ideaId}`,
    ideaId: idea.ideaId,
    missionId,
    missionName: idea.relatedMissionName ?? idea.title,
    title: idea.title,
    status,
    statusLabel: productBriefStateLabel(status),
    createdAt: idea.createdAt,
    updatedAt: idea.updatedAt,
    plannerNotes,
    reviewNotes,
    approvalNotes,
    approvedAt: approved ? idea.updatedAt : null,
    approvedBy: approved ? "CEO" : null,
    handoffReady,
    planner: "Product Planner",
    reviewStateLabel: mapReviewState(status),
    approvalStateLabel: mapApprovalState(status),
    directorReadinessLabel: handoffReady
      ? "Ready"
      : approved
        ? "Approved — handoff consideration"
        : "Not ready",
  };
}

export function buildProductBriefRecords(missions: Mission[]): ProductBriefRecord[] {
  const ideas = buildProductIdeas(missions);
  return ideas
    .filter((i) => i.status !== "captured" || i.relatedMissionId)
    .map((idea) => {
      const mission = idea.relatedMissionId
        ? missions.find((m) => m.id === idea.relatedMissionId) ?? null
        : null;
      return buildProductBriefRecord({ idea, mission });
    });
}

export function buildProductBriefBoardRows(records: ProductBriefRecord[]): ProductBriefBoardRow[] {
  return records.map((b) => ({
    title: b.title,
    status: b.statusLabel,
    statusId: b.status,
    planner: b.planner,
    reviewState: b.reviewStateLabel,
    approvalState: b.approvalStateLabel,
    directorReadiness: b.directorReadinessLabel,
    lastUpdated: b.updatedAt,
    briefId: b.briefId,
    missionId: b.missionId,
  }));
}

export function buildProductBriefHistory(brief: ProductBriefRecord): ProductBriefHistoryStep[] {
  const steps: Array<{ id: string; label: string }> = [
    { id: "draft", label: "Draft Created" },
    { id: "review", label: "Review Requested" },
    { id: "updated", label: "Review Updated" },
    { id: "changes", label: "Changes Requested" },
    { id: "approved", label: "Approved" },
    { id: "director", label: "Director Ready" },
    { id: "archived", label: "Archived" },
  ];

  const order: ProductBriefStateId[] = [
    "draft",
    "under_review",
    "review_requested",
    "changes_requested",
    "approved",
    "director_handoff_ready",
    "archived",
  ];
  const currentIndex = order.indexOf(brief.status);

  return steps.map((step, index) => {
    const stepIndex = index;

    let detail = productBriefStateNote(brief.title, brief.status);
    if (step.id === "draft") detail = `${brief.title} Product Brief draft created.`;
    if (step.id === "review" && currentIndex >= 1)
      detail = "This Product Brief is currently under review.";
    if (step.id === "approved" && currentIndex >= 4)
      detail = "CEO approval recorded—human authorization only.";
    if (step.id === "director" && brief.handoffReady)
      detail = "This Product Brief is available for Director handoff consideration.";

    return {
      id: step.id,
      label: step.label,
      status:
        stepIndex < currentIndex
          ? ("completed" as const)
          : stepIndex === currentIndex
            ? ("current" as const)
            : ("upcoming" as const),
      detail,
    };
  });
}

export function buildProductBriefOverviewSummary(
  records: ProductBriefRecord[]
): ProductBriefOverviewSummary {
  return {
    draftBriefs: records.filter((b) => b.status === "draft").length,
    underReview: records.filter(
      (b) =>
        b.status === "under_review" ||
        b.status === "review_requested" ||
        b.status === "changes_requested"
    ).length,
    approvedBriefs: records.filter((b) => b.status === "approved").length,
    directorReadyBriefs: records.filter((b) => b.status === "director_handoff_ready").length,
    advisoryNote: productBriefWorkspaceAdvisoryNote,
  };
}

export function buildPlannerBriefView(records: ProductBriefRecord[]): PlannerBriefView {
  return {
    activeBriefs: records.filter(
      (b) =>
        b.status === "draft" ||
        b.status === "under_review" ||
        b.status === "review_requested"
    ),
    reviewRequests: records.filter(
      (b) => b.status === "review_requested" || b.status === "under_review"
    ),
    pendingQuestions: records.filter((b) => b.status === "changes_requested"),
    approvedBriefs: records.filter(
      (b) => b.status === "approved" || b.status === "director_handoff_ready"
    ),
    advisoryNote: "Product Planner organizes briefs—CEO approves before Director planning.",
  };
}

export function buildDirectorBriefView(records: ProductBriefRecord[]): DirectorBriefView {
  const handoffReady = records.filter((b) => b.status === "director_handoff_ready");
  const approved = records.filter((b) => b.status === "approved");
  return {
    handoffReadyBriefs: handoffReady,
    approvedBriefs: approved,
    planningQueue: [...handoffReady, ...approved],
    advisoryNote:
      "Director receives approved planning only—handoff candidates shown for human coordination, not automatic assignment.",
  };
}

export function buildHandoffCandidates(records: ProductBriefRecord[]) {
  return records
    .filter((b) => b.handoffReady || b.status === "approved")
    .map((b) => ({
      briefId: b.briefId,
      title: b.title,
      missionId: b.missionId,
      status: b.statusLabel,
      note: b.handoffReady
        ? "Director Handoff Candidate — approved and ready for planning consideration."
        : "Approved Product Brief — handoff may be considered when aligned.",
      teamHandoffHref: b.missionId ? `/team-handoff?mission=${b.missionId}` : "/team-handoff",
      artifactReviewHref: b.missionId
        ? `/artifact-review?mission=${b.missionId}&artifact=${b.missionId}-product_brief`
        : "/artifact-review",
    }));
}

export function buildLifecycleBriefTransition(records: ProductBriefRecord[]) {
  return {
    ideaStageBriefs: records.filter(
      (b) => b.status === "draft" || b.status === "under_review"
    ).length,
    planningStageBriefs: records.filter(
      (b) =>
        b.status === "approved" ||
        b.status === "director_handoff_ready" ||
        b.status === "review_requested"
    ).length,
    transitionNote:
      "Idea → Planning transition when Product Brief moves from draft through CEO approval.",
  };
}

export function buildProductBriefWorkspaceData(input: {
  missions: Mission[];
  briefId?: string | null;
  missionId?: string | null;
  statusFilter?: ProductBriefStateId | null;
}) {
  let records = buildProductBriefRecords(input.missions);

  if (input.missionId) {
    records = records.filter((b) => b.missionId === input.missionId);
  }
  if (input.statusFilter) {
    records = records.filter((b) => b.status === input.statusFilter);
  }

  const allRecords = buildProductBriefRecords(input.missions);
  const selectedBrief = input.briefId
    ? records.find((b) => b.briefId === input.briefId) ??
      allRecords.find((b) => b.briefId === input.briefId)
    : records[0];

  return {
    records,
    allRecords,
    selectedBrief: selectedBrief ?? null,
    board: buildProductBriefBoardRows(records),
    overview: buildProductBriefOverviewSummary(allRecords),
    plannerView: buildPlannerBriefView(allRecords),
    directorView: buildDirectorBriefView(allRecords),
    handoffCandidates: buildHandoffCandidates(allRecords),
    lifecycle: buildLifecycleBriefTransition(allRecords),
    history: selectedBrief ? buildProductBriefHistory(selectedBrief) : [],
    reviewContext: selectedBrief
      ? buildProductBriefReviewContext({ brief: selectedBrief, missions: input.missions })
      : null,
    approvalContext: selectedBrief ? buildProductBriefApprovalContext(selectedBrief) : null,
    progressNote: selectedBrief
      ? productBriefStateNote(selectedBrief.title, selectedBrief.status)
      : "",
  };
}
