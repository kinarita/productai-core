import type { Mission } from "@/types/productai";
import type { ProductIdea, IdeaStateId } from "@/lib/idea/ideaWorkspace";
import { ideaStateLabel, ideaProgressNote } from "@/lib/idea/ideaWorkspace";
import { inferMissionWorkflowStage } from "@/lib/mission-team/missionWorkflow";
import { buildProductBrief } from "@/lib/idea/productBrief";

export interface IdeaOverviewSummary {
  ideas: number;
  ideasInReview: number;
  productBriefDrafts: number;
  approvedBriefs: number;
  advisoryNote: string;
}

export interface PlannerIdeaView {
  activeIdeas: ProductIdea[];
  productBriefDrafts: ProductIdea[];
  pendingReviews: ProductIdea[];
  advisoryNote: string;
}

export interface HandoffReadyBrief {
  ideaId: string;
  title: string;
  missionId: string;
  missionName: string;
  handoffNote: string;
  artifactReviewHref: string;
}

function inferIdeaStatus(mission: Mission): IdeaStateId {
  if (mission.status === "completed") return "archived";
  const stage = inferMissionWorkflowStage(mission);

  if (stage === "ceo_idea") return "captured";
  if (stage === "product_planning") {
    if (mission.progress < 25) return "exploring";
    if (mission.progress < 45) return "refining";
    if (mission.progress < 60) return "product_brief_draft";
    return "ready_for_review";
  }
  if (stage === "ceo_authorization") return "ready_for_review";
  if (
    stage === "mission_direction" ||
    stage === "architecture" ||
    stage === "design" ||
    stage === "development" ||
    stage === "qa" ||
    stage === "release"
  ) {
    return mission.progress >= 50 ? "approved" : "ready_for_review";
  }
  return "exploring";
}

function missionToIdea(mission: Mission): ProductIdea {
  const tags: string[] = [];
  if (mission.name.toLowerCase().includes("portal")) tags.push("enterprise");
  if (mission.name.toLowerCase().includes("analytics")) tags.push("analytics");
  if (mission.name.toLowerCase().includes("mobile") || mission.name.toLowerCase().includes("onboarding"))
    tags.push("mobile");

  const status = inferIdeaStatus(mission);

  return {
    ideaId: `idea-${mission.id}`,
    title: mission.name,
    description: mission.summary || mission.description,
    createdAt: mission.createdAt ?? mission.updatedAt,
    updatedAt: mission.updatedAt,
    status,
    owner: "CEO",
    tags,
    notes: mission.blockers.length > 0 ? [`Blockers: ${mission.blockers.join("; ")}`] : [],
    relatedMissionId: mission.id,
    relatedMissionName: mission.name,
  };
}

const standaloneIdeas: ProductIdea[] = [
  {
    ideaId: "idea-standalone-1",
    title: "Partner API Marketplace",
    description:
      "Expose curated partner integrations so enterprise customers can enable billing and support connectors without custom engineering.",
    createdAt: "2026-05-26T09:00:00Z",
    updatedAt: "1d ago",
    status: "captured",
    owner: "CEO",
    tags: ["enterprise", "platform"],
    notes: ["Initial CEO capture—Planner has not yet organized."],
  },
  {
    ideaId: "idea-standalone-2",
    title: "Executive Digest Notifications",
    description:
      "Weekly digest summarizing mission health, pending reviews, and governance attention for CEO reading.",
    createdAt: "2026-05-27T14:00:00Z",
    updatedAt: "12h ago",
    status: "exploring",
    owner: "CEO",
    tags: ["governance"],
    notes: ["Exploring fit with existing CEO Home overview cards."],
  },
];

export function buildProductIdeas(missions: Mission[]): ProductIdea[] {
  const fromMissions = missions
    .filter((m) => m.status === "planning" || m.status === "active" || m.status === "on_hold")
    .map(missionToIdea);

  const standalone = standaloneIdeas.filter(
    (s) => !fromMissions.some((m) => m.title === s.title)
  );

  return [...standalone, ...fromMissions];
}

export function buildIdeaOverviewSummary(ideas: ProductIdea[]): IdeaOverviewSummary {
  return {
    ideas: ideas.filter((i) => i.status !== "archived").length,
    ideasInReview: ideas.filter((i) => i.status === "ready_for_review").length,
    productBriefDrafts: ideas.filter(
      (i) => i.status === "product_brief_draft" || i.status === "refining"
    ).length,
    approvedBriefs: ideas.filter((i) => i.status === "approved").length,
    advisoryNote:
      "CEO thinks, AI organizes, CEO approves—idea workspace supports planning only, not automatic mission creation.",
  };
}

export function buildPlannerIdeaView(ideas: ProductIdea[]): PlannerIdeaView {
  const plannerStatuses: IdeaStateId[] = [
    "exploring",
    "refining",
    "product_brief_draft",
    "ready_for_review",
  ];

  return {
    activeIdeas: ideas.filter((i) => plannerStatuses.includes(i.status)),
    productBriefDrafts: ideas.filter(
      (i) => i.status === "product_brief_draft" || i.status === "refining"
    ),
    pendingReviews: ideas.filter((i) => i.status === "ready_for_review"),
    advisoryNote:
      "Product Planner organizes ideas into briefs—does not author missions or tasks automatically.",
  };
}

export function buildHandoffReadyBriefs(ideas: ProductIdea[]): HandoffReadyBrief[] {
  return ideas
    .filter((i) => i.status === "approved" && i.relatedMissionId)
    .map((i) => ({
      ideaId: i.ideaId,
      title: i.title,
      missionId: i.relatedMissionId!,
      missionName: i.relatedMissionName ?? i.title,
      handoffNote:
        "Approved Product Brief may be handed to Director for mission planning—human coordination only, not automatic hand-off.",
      artifactReviewHref: `/artifact-review?mission=${i.relatedMissionId}&artifact=${i.relatedMissionId}-product_brief`,
    }));
}

export function getIdeaLifecycleConnection(ideas: ProductIdea[]) {
  const ideaStage = ideas.filter(
    (i) =>
      i.status === "captured" || i.status === "exploring" || i.status === "refining"
  ).length;
  const planningStage = ideas.filter(
    (i) =>
      i.status === "product_brief_draft" ||
      i.status === "ready_for_review" ||
      i.status === "approved"
  ).length;

  return {
    ideaStageCount: ideaStage,
    planningStageCount: planningStage,
    connectionNote:
      "Idea and Planning stages connect to Product Lifecycle—CEO Idea through Product Brief authorization.",
  };
}

export function buildIdeaWorkspaceData(input: {
  missions: Mission[];
  ideaId?: string | null;
  statusFilter?: IdeaStateId | null;
}) {
  let ideas = buildProductIdeas(input.missions);

  if (input.statusFilter) {
    ideas = ideas.filter((i) => i.status === input.statusFilter);
  }

  const selectedIdea = input.ideaId
    ? ideas.find((i) => i.ideaId === input.ideaId) ?? buildProductIdeas(input.missions).find((i) => i.ideaId === input.ideaId)
    : ideas[0];

  const brief = selectedIdea ? buildProductBrief(selectedIdea) : null;

  return {
    ideas,
    selectedIdea: selectedIdea ?? null,
    brief,
    overview: buildIdeaOverviewSummary(buildProductIdeas(input.missions)),
    plannerView: buildPlannerIdeaView(buildProductIdeas(input.missions)),
    handoffReady: buildHandoffReadyBriefs(buildProductIdeas(input.missions)),
    lifecycle: getIdeaLifecycleConnection(buildProductIdeas(input.missions)),
    progressNote: selectedIdea ? ideaProgressNote(selectedIdea) : "",
    statusLabel: selectedIdea ? ideaStateLabel(selectedIdea.status) : "—",
  };
}
