import type {
  Mission,
  OrganizationFeedItem,
  ReleaseItem,
  Task,
  PullRequest,
  MemoryItem,
} from "@/types/productai";
import { inferMissionWorkflowStage } from "@/lib/mission-team/missionWorkflow";
import type { MissionWorkflowStageId } from "@/lib/mission-team/missionWorkflow";
import { buildProductIdeas } from "@/lib/idea/ideaAnalysis";
import { buildLineageOverview } from "@/lib/lineage/artifactLineageAnalysis";
import {
  buildCrossReviewOverview,
  buildCrossRoleReviewRecords,
  buildReviewConcentration,
} from "@/lib/cross-review/crossRoleReviewAnalysis";
import type { ReviewStateId } from "@/lib/review/reviewStatus";
import { buildCooWorkflowSummary } from "@/lib/coo/cooWorkflowSummary";
import { buildReleaseOverviewSummary } from "@/lib/release/releaseSummary";
import { buildLifecycleOverviewSummary } from "@/lib/lifecycle/lifecycleSummary";
import { buildOutcomeSignals } from "@/lib/outcome/outcomeSignals";
import { inferOutcomeStatus } from "@/lib/outcome/outcomeAnalysis";
import { buildHandoffOverviewSummary } from "@/lib/handoff/handoffAnalysis";
import {
  handoffFlowSteps,
  handoffRoleLabel,
  inferHandoffRoleFromWorkflow,
} from "@/lib/handoff/handoffWorkflow";
import type { HandoffRoleId } from "@/lib/handoff/handoffWorkflow";
import { ceoCommandCenterAdvisoryNote } from "@/lib/ceo-command/ceoCommandCenterWorkspace";
import { workspaceHrefForRole } from "@/lib/ceo-command/ceoCommandCenterWorkspace";
import { artifactLineageHref } from "@/lib/lineage/artifactLineageWorkspace";
import { crossReviewWorkspaceHref } from "@/lib/cross-review/crossRoleReviewWorkspace";

export type CeoPipelineStageId =
  | "idea"
  | "brief"
  | "mission"
  | "architecture"
  | "design"
  | "development_plan"
  | "qa"
  | "release";

export const ceoPipelineStages: { id: CeoPipelineStageId; label: string }[] = [
  { id: "idea", label: "Idea" },
  { id: "brief", label: "Brief" },
  { id: "mission", label: "Mission" },
  { id: "architecture", label: "Architecture" },
  { id: "design", label: "Design" },
  { id: "development_plan", label: "Development Plan" },
  { id: "qa", label: "QA" },
  { id: "release", label: "Release" },
];

const workflowToPipeline: Record<MissionWorkflowStageId, CeoPipelineStageId> = {
  ceo_idea: "idea",
  product_planning: "brief",
  ceo_authorization: "brief",
  mission_direction: "mission",
  architecture: "architecture",
  design: "design",
  development: "development_plan",
  qa: "qa",
  release: "release",
  reflection: "release",
};

export interface ExecutiveOverviewSummary {
  activeIdeas: number;
  activeMissions: number;
  activeReviews: number;
  releaseCandidates: number;
  activeOutcomes: number;
  advisoryNote: string;
}

export interface ProductPipelineStageCount {
  stage: CeoPipelineStageId;
  label: string;
  count: number;
}

export interface ReviewAttentionSummary {
  pendingReviews: number;
  reviewConcentrations: number;
  changesRequested: number;
  reviewCandidates: number;
  advisoryNote: string;
}

export interface MissionAttentionSummary {
  activeMissions: number;
  blockedMissions: number;
  planningMissions: number;
  releaseReadyMissions: number;
  advisoryNote: string;
}

export interface ArtifactHealthSummary {
  completeLineages: number;
  incompleteLineages: number;
  activeArtifacts: number;
  reviewCoverage: number;
  advisoryNote: string;
}

export interface TeamActivityRow {
  role: HandoffRoleId;
  roleLabel: string;
  activeWork: number;
  reviews: number;
  handoffs: number;
}

export interface ExecutiveFeedItem {
  id: string;
  category: "idea" | "review" | "delivery" | "release";
  label: string;
  message: string;
  timestamp: string;
  missionName: string;
}

export interface RecommendedReadingItem {
  title: string;
  note: string;
  href: string;
}

export interface CeoDailySnapshot {
  ideasInProgress: number;
  briefsUnderReview: number;
  architectureReviews: number;
  designReviews: number;
  developmentReviews: number;
  qaReviews: number;
  releaseCandidates: number;
  advisoryNote: string;
}

export interface MissionCommandRow {
  missionId: string;
  missionName: string;
  status: string;
  health: string;
  pipelineStage: string;
  lifecycleHref: string;
  lineageHref: string;
  reviewHref: string;
  workspaceHref: string;
}

function isActiveReview(state: ReviewStateId): boolean {
  return (
    state === "ready_for_review" ||
    state === "review_requested" ||
    state === "in_review" ||
    state === "changes_requested"
  );
}

function mapPipelineStage(mission: Mission): CeoPipelineStageId {
  return workflowToPipeline[inferMissionWorkflowStage(mission)] ?? "mission";
}

export function buildExecutiveOverview(input: {
  missions: Mission[];
  tasks: Task[];
  releases: ReleaseItem[];
  memories: MemoryItem[];
  feedItems: OrganizationFeedItem[];
}): ExecutiveOverviewSummary {
  const ideas = buildProductIdeas(input.missions);
  const activeIdeas = ideas.filter((i) => i.status !== "archived").length;
  const activeMissions = input.missions.filter(
    (m) => m.status === "active" || m.status === "planning"
  ).length;
  const reviewOverview = buildCrossReviewOverview({
    missions: input.missions,
    tasks: input.tasks,
  });
  const activeReviews =
    reviewOverview.pendingReviews + reviewOverview.inReview + reviewOverview.changesRequested;
  const releaseCandidates = input.releases.filter(
    (r) => r.state === "candidate" || r.state === "staging"
  ).length;

  let activeOutcomes = 0;
  for (const mission of input.missions) {
    const signals = buildOutcomeSignals({
      mission,
      tasks: input.tasks,
      memories: input.memories,
      feedItems: input.feedItems,
      releases: input.releases,
    });
    const status = inferOutcomeStatus({
      mission,
      releases: input.releases,
      signalCount: signals.length,
      memoryCount: input.memories.filter((m) => m.relatedMissionId === mission.id).length,
    });
    if (status !== "not_observed") activeOutcomes += 1;
  }

  return {
    activeIdeas,
    activeMissions,
    activeReviews,
    releaseCandidates,
    activeOutcomes,
    advisoryNote: ceoCommandCenterAdvisoryNote,
  };
}

export function buildProductPipelineCounts(missions: Mission[]): ProductPipelineStageCount[] {
  const counts = Object.fromEntries(
    ceoPipelineStages.map((s) => [s.id, 0])
  ) as Record<CeoPipelineStageId, number>;

  for (const mission of missions) {
    if (mission.status === "completed") continue;
    const stage = mapPipelineStage(mission);
    counts[stage] += 1;
  }

  return ceoPipelineStages.map((s) => ({
    stage: s.id,
    label: s.label,
    count: counts[s.id],
  }));
}

export function buildReviewAttention(input: {
  missions: Mission[];
  tasks: Task[];
}): ReviewAttentionSummary {
  const overview = buildCrossReviewOverview({ missions: input.missions, tasks: input.tasks });
  const concentration = buildReviewConcentration({
    missions: input.missions,
    tasks: input.tasks,
  });
  const records = buildCrossRoleReviewRecords({ missions: input.missions, tasks: input.tasks });
  const candidates = records.filter((r) => isActiveReview(r.reviewState)).length;

  return {
    pendingReviews: overview.pendingReviews,
    reviewConcentrations: concentration.byRole.reduce((s, r) => s + r.count, 0),
    changesRequested: overview.changesRequested,
    reviewCandidates: candidates,
    advisoryNote:
      "Review attention highlights areas for human reading—recommendations only, no automatic approval.",
  };
}

export function buildMissionAttention(input: {
  missions: Mission[];
}): MissionAttentionSummary {
  const coo = buildCooWorkflowSummary(input.missions);
  const blocked = input.missions.filter(
    (m) => m.health === "blocked" || m.health === "risky"
  ).length;
  const planning = input.missions.filter((m) => m.status === "planning").length;

  return {
    activeMissions: coo.activeMissionCount,
    blockedMissions: blocked,
    planningMissions: planning,
    releaseReadyMissions: coo.releaseReadyCount,
    advisoryNote:
      "Mission attention aggregates COO-visible mission states—no automatic prioritization.",
  };
}

export function buildArtifactHealth(input: {
  missions: Mission[];
  tasks: Task[];
}): ArtifactHealthSummary {
  const lineage = buildLineageOverview({ missions: input.missions, tasks: input.tasks });
  const records = buildCrossRoleReviewRecords({ missions: input.missions, tasks: input.tasks });
  const withReview = records.filter((r) => r.reviewState !== "draft").length;

  return {
    completeLineages: lineage.completeLineages,
    incompleteLineages: lineage.incompleteLineages,
    activeArtifacts: lineage.activeLineages * 7,
    reviewCoverage: records.length > 0 ? Math.round((withReview / records.length) * 100) : 0,
    advisoryNote:
      "Artifact health connects lineage completeness with review coverage—visibility only.",
  };
}

export function buildTeamActivity(input: {
  missions: Mission[];
  tasks: Task[];
}): TeamActivityRow[] {
  const roles = handoffFlowSteps.filter(
    (s) => s.id !== "ceo" && s.id !== "release"
  ) as { id: HandoffRoleId }[];

  const records = buildCrossRoleReviewRecords({ missions: input.missions, tasks: input.tasks });
  const handoff = buildHandoffOverviewSummary({ missions: input.missions });

  return roles.map((step) => {
    const role = step.id;
    const activeWork = input.missions.filter((m) => {
      if (m.status === "completed") return false;
      return inferHandoffRoleFromWorkflow(inferMissionWorkflowStage(m)) === role;
    }).length;

    const reviews = records.filter((r) => r.ownerRole === role && isActiveReview(r.reviewState)).length;
    const handoffs = input.missions.filter((m) => {
      const stage = inferMissionWorkflowStage(m);
      const current = inferHandoffRoleFromWorkflow(stage);
      return current === role && m.progress >= 70;
    }).length;

    return {
      role,
      roleLabel: handoffRoleLabel(role),
      activeWork,
      reviews,
      handoffs:
        handoffs ||
        (role === "product_planner" ? 0 : Math.min(handoff.completedHandoffs, 1)),
    };
  });
}

function categorizeFeed(item: OrganizationFeedItem): ExecutiveFeedItem["category"] | null {
  const t = item.type;
  if (
    t.includes("idea") ||
    t.includes("product_brief") ||
    t === "planning_started" ||
    t === "planning_completed"
  ) {
    return "idea";
  }
  if (t.includes("review") || t.includes("artifact_") || t.includes("brief_review")) {
    return "review";
  }
  if (
    t.includes("delivery") ||
    t.includes("task_") ||
    t.includes("repository") ||
    t.includes("pull_request") ||
    t === "implementation"
  ) {
    return "delivery";
  }
  if (t.includes("release") || t.includes("outcome")) {
    return "release";
  }
  return null;
}

export function buildExecutiveFeedSummary(
  feedItems: OrganizationFeedItem[],
  limit = 12
): ExecutiveFeedItem[] {
  return feedItems
    .map((item) => {
      const category = categorizeFeed(item);
      if (!category) return null;
      return {
        id: item.id,
        category,
        label: item.type.replaceAll("_", " "),
        message: item.message,
        timestamp: item.timestamp,
        missionName: item.missionName,
      };
    })
    .filter((x): x is ExecutiveFeedItem => x != null)
    .slice(0, limit);
}

export function buildRecommendedReading(input: {
  missions: Mission[];
  tasks: Task[];
  releases: ReleaseItem[];
}): RecommendedReadingItem[] {
  const items: RecommendedReadingItem[] = [];
  const concentration = buildReviewConcentration({
    missions: input.missions,
    tasks: input.tasks,
  });
  const lineage = buildLineageOverview({ missions: input.missions, tasks: input.tasks });
  const release = buildReleaseOverviewSummary({
    missions: input.missions,
    tasks: input.tasks,
    pullRequests: [],
    releases: input.releases,
  });

  if (concentration.byMission.some((m) => m.count >= 2)) {
    const top = concentration.byMission[0];
    items.push({
      title: "Review Context",
      note: top
        ? `This mission may benefit from additional review visibility (${top.missionName}).`
        : "Several missions show active review activity worth reading.",
      href: top
        ? crossReviewWorkspaceHref({ missionId: top.missionId })
        : "/review-workspace",
    });
  }

  if (lineage.incompleteLineages > 0) {
    items.push({
      title: "Active Lineages",
      note: `${lineage.incompleteLineages} mission lineage(s) remain incomplete for traceability reading.`,
      href: "/artifact-lineage",
    });
  }

  if (release.candidate > 0 || release.readyForRelease > 0) {
    items.push({
      title: "Release Readiness",
      note: `${release.candidate + release.readyForRelease} mission(s) appear in release readiness views—human judgment required.`,
      href: "/release-workspace",
    });
  }

  if (lineage.activeLineages > 0) {
    items.push({
      title: "Outcome Observations",
      note: "Post-release outcome signals may be available in Code & Release workspace for continuity reading.",
      href: "/code-release-workspace",
    });
  }

  if (items.length === 0) {
    items.push({
      title: "Executive Reading",
      note: "No specific reading suggestions in view—explore workspaces as needed for continuity.",
      href: "/ceo-home",
    });
  }

  return items;
}

export function buildCeoDailySnapshot(input: {
  missions: Mission[];
  tasks: Task[];
  releases: ReleaseItem[];
}): CeoDailySnapshot {
  const ideas = buildProductIdeas(input.missions);
  const records = buildCrossRoleReviewRecords({ missions: input.missions, tasks: input.tasks });

  const countByType = (type: string) =>
    records.filter((r) => r.artifactType === type && isActiveReview(r.reviewState)).length;

  return {
    ideasInProgress: ideas.filter(
      (i) => i.status === "exploring" || i.status === "refining" || i.status === "captured"
    ).length,
    briefsUnderReview: records.filter(
      (r) => r.artifactType === "product_brief" && isActiveReview(r.reviewState)
    ).length,
    architectureReviews: countByType("technical_specification"),
    designReviews: countByType("design_specification"),
    developmentReviews: countByType("implementation_plan"),
    qaReviews: countByType("test_plan"),
    releaseCandidates: input.releases.filter(
      (r) => r.state === "candidate" || r.state === "staging"
    ).length,
    advisoryNote: "Daily snapshot for executive reading—not a task list or approval queue.",
  };
}

export function buildMissionCommandRows(missions: Mission[]): MissionCommandRow[] {
  return missions
    .filter((m) => m.status !== "completed")
    .map((mission) => {
      const pipeline = ceoPipelineStages.find((s) => s.id === mapPipelineStage(mission))!;
      const role = inferHandoffRoleFromWorkflow(inferMissionWorkflowStage(mission));

      return {
        missionId: mission.id,
        missionName: mission.name,
        status: mission.status,
        health: mission.health,
        pipelineStage: pipeline.label,
        lifecycleHref: `/product-lifecycle?mission=${mission.id}`,
        lineageHref: artifactLineageHref({ missionId: mission.id }),
        reviewHref: crossReviewWorkspaceHref({ missionId: mission.id }),
        workspaceHref: workspaceHrefForRole(role, mission.id),
      };
    });
}

export function buildCeoCommandCenterData(input: {
  missions: Mission[];
  tasks: Task[];
  feedItems: OrganizationFeedItem[];
  releases: ReleaseItem[];
  memories: MemoryItem[];
  pullRequests: PullRequest[];
  missionId?: string | null;
  attentionFilter?: import("@/lib/ceo-command/ceoCommandCenterWorkspace").CeoAttentionFilterId;
}) {
  const filteredMissions = input.missionId
    ? input.missions.filter((m) => m.id === input.missionId)
    : input.missions;

  const lifecycleOverview = buildLifecycleOverviewSummary({
    missions: input.missions,
    tasks: input.tasks,
    pullRequests: input.pullRequests,
    releases: input.releases,
    memories: input.memories,
    feedItems: input.feedItems,
  });

  return {
    executiveOverview: buildExecutiveOverview({
      missions: input.missions,
      tasks: input.tasks,
      releases: input.releases,
      memories: input.memories,
      feedItems: input.feedItems,
    }),
    pipeline: buildProductPipelineCounts(input.missions),
    reviewAttention: buildReviewAttention({
      missions: input.missions,
      tasks: input.tasks,
    }),
    missionAttention: buildMissionAttention({ missions: input.missions }),
    artifactHealth: buildArtifactHealth({
      missions: input.missions,
      tasks: input.tasks,
    }),
    teamActivity: buildTeamActivity({
      missions: input.missions,
      tasks: input.tasks,
    }),
    executiveFeed: buildExecutiveFeedSummary(input.feedItems),
    recommendedReading: buildRecommendedReading({
      missions: input.missions,
      tasks: input.tasks,
      releases: input.releases,
    }),
    dailySnapshot: buildCeoDailySnapshot({
      missions: input.missions,
      tasks: input.tasks,
      releases: input.releases,
    }),
    missionRows: buildMissionCommandRows(filteredMissions),
    lifecycleOverview,
    progressNote: input.missionId
      ? `Focused on ${filteredMissions[0]?.name ?? "mission"}—use deep links for lifecycle, lineage, and review.`
      : "Executive command center aggregates workspace visibility—human decisions only.",
  };
}
