import type { Mission, Task } from "@/types/productai";
import { buildHandoffArtifactsForMission } from "@/lib/handoff/handoffAnalysis";
import type { HandoffStatusId } from "@/lib/handoff/handoffStatus";
import {
  type ArtifactReviewRecord,
  type ReviewTargetTypeId,
  isReviewTargetType,
  reviewTargetDefinitions,
} from "@/lib/review/artifactReview";
import { artifactIdForReview } from "@/lib/review/reviewComments";
import { handoffRoleLabel } from "@/lib/handoff/handoffWorkflow";
import type { ReviewStateId } from "@/lib/review/reviewStatus";
import { reviewStateLabel, reviewStateNote } from "@/lib/review/reviewStatus";
import {
  countCommentsForArtifact,
  getCommentsForArtifact,
  getCommentsForMission,
  seededReviewComments,
} from "@/lib/review/reviewComments";
import { buildReviewRecommendations } from "@/lib/review/reviewRecommendations";

export interface ReviewBoardRow {
  artifact: string;
  owner: string;
  mission: string;
  missionId: string;
  artifactId: string;
  reviewState: string;
  reviewStateId: ReviewStateId;
  comments: number;
  reviews: number;
  lastUpdated: string;
  nextSuggestedStep: string;
}

export interface ReviewTimelineStep {
  id: string;
  label: string;
  status: "completed" | "current" | "upcoming";
  detail: string;
}

export interface ReviewOverviewSummary {
  pendingReviews: number;
  inReview: number;
  changesRequested: number;
  approvedArtifacts: number;
  advisoryNote: string;
}

export interface MissionReviewContext {
  missionId: string;
  missionName: string;
  currentArtifact: string;
  currentArtifactId: string;
  reviewState: ReviewStateId;
  reviewStateLabel: string;
  reviewHistory: Array<{ label: string; state: string; at: string }>;
  pendingReviewCount: number;
  progressNote: string;
}

export interface CooReviewCoordination {
  reviewConcentrations: number;
  pendingReviews: number;
  crossTeamReviewAreas: string[];
  advisoryNote: string;
}

function mapHandoffToReviewState(
  handoffStatus: HandoffStatusId,
  mission: Mission,
  tasks: Task[],
  commentCount: number
): ReviewStateId {
  const missionTasks = tasks.filter((t) => t.missionId === mission.id);
  const inReviewTasks = missionTasks.filter((t) => t.status === "in_review").length;

  if (handoffStatus === "archived") return "archived";
  if (handoffStatus === "handed_off") return "approved";
  if (handoffStatus === "returned") return "changes_requested";
  if (handoffStatus === "approved") return commentCount > 0 ? "in_review" : "approved";
  if (handoffStatus === "ready_for_review") {
    if (inReviewTasks > 0) return "in_review";
    return commentCount > 0 ? "review_requested" : "ready_for_review";
  }
  return "draft";
}

function inferReviewCount(state: ReviewStateId, missionProgress: number): number {
  if (state === "archived" || state === "approved") return 2;
  if (state === "in_review" || state === "changes_requested") return 1;
  if (state === "ready_for_review" || state === "review_requested") return 0;
  return 0;
}

function recommendedNextAction(record: ArtifactReviewRecord): string {
  switch (record.reviewState) {
    case "draft":
      return "Continue drafting within owning role.";
    case "ready_for_review":
    case "review_requested":
      return "Schedule human review—no automatic approval.";
    case "in_review":
      return "Resolve open comments before handoff consideration.";
    case "changes_requested":
      return "Address feedback and re-request review when ready.";
    case "approved":
      return "Consider handoff to next role when stakeholders align.";
    case "archived":
      return "Archived for continuity reading only.";
    default:
      return "Review support only—human approval required.";
  }
}

export function buildArtifactReviewRecord(input: {
  mission: Mission;
  typeId: ReviewTargetTypeId;
  tasks: Task[];
}): ArtifactReviewRecord {
  const handoffArtifacts = buildHandoffArtifactsForMission(input.mission);
  const handoff = handoffArtifacts.find((a) => a.typeId === input.typeId);
  const artifactId = artifactIdForReview(input.mission.id, input.typeId);
  const commentCount = countCommentsForArtifact(artifactId);
  const reviewState = mapHandoffToReviewState(
    handoff?.status ?? "draft",
    input.mission,
    input.tasks,
    commentCount
  );
  const reviewCount = inferReviewCount(reviewState, input.mission.progress);
  const target = reviewTargetDefinitions.find((t) => t.id === input.typeId)!;

  const lastReviewedAt =
    reviewState === "approved" || reviewState === "in_review"
      ? input.mission.updatedAt
      : commentCount > 0
        ? seededReviewComments.find((c) => c.artifactId === artifactId)?.createdAt ?? null
        : null;

  return {
    artifactId,
    artifactType: input.typeId,
    artifactTitle: target.title,
    missionId: input.mission.id,
    missionName: input.mission.name,
    ownerRole: target.ownerRole,
    ownerRoleLabel: handoffRoleLabel(target.ownerRole),
    reviewState,
    reviewStateLabel: reviewStateLabel(reviewState),
    createdAt: input.mission.createdAt ?? input.mission.updatedAt,
    updatedAt: input.mission.updatedAt,
    reviewCount,
    commentCount,
    lastReviewedAt,
    recommendedNextAction: "",
    summary: handoff?.summary ?? `${target.title} for ${input.mission.name}.`,
  };
}

export function buildArtifactReviewRecords(input: {
  missions: Mission[];
  tasks: Task[];
  missionId?: string | null;
  reviewStateFilter?: ReviewStateId | null;
}): ArtifactReviewRecord[] {
  const filtered = input.missionId
    ? input.missions.filter((m) => m.id === input.missionId)
    : input.missions;

  const records: ArtifactReviewRecord[] = [];

  for (const mission of filtered) {
    const handoffArtifacts = buildHandoffArtifactsForMission(mission);
    for (const ha of handoffArtifacts) {
      if (!isReviewTargetType(ha.typeId)) continue;
      const record = buildArtifactReviewRecord({
        mission,
        typeId: ha.typeId,
        tasks: input.tasks,
      });
      record.recommendedNextAction = recommendedNextAction(record);
      if (!input.reviewStateFilter || record.reviewState === input.reviewStateFilter) {
        records.push(record);
      }
    }
  }

  return records;
}

export function buildReviewBoardRows(records: ArtifactReviewRecord[]): ReviewBoardRow[] {
  return records.map((r) => ({
    artifact: r.artifactTitle,
    owner: r.ownerRoleLabel,
    mission: r.missionName,
    missionId: r.missionId,
    artifactId: r.artifactId,
    reviewState: r.reviewStateLabel,
    reviewStateId: r.reviewState,
    comments: r.commentCount,
    reviews: r.reviewCount,
    lastUpdated: r.updatedAt,
    nextSuggestedStep: r.recommendedNextAction,
  }));
}

export function buildReviewTimeline(input: {
  record: ArtifactReviewRecord;
}): ReviewTimelineStep[] {
  const { record } = input;
  const state = record.reviewState;

  const steps: Array<{ id: string; label: string; minState: ReviewStateId[] }> = [
    { id: "created", label: "Artifact Created", minState: ["draft", "ready_for_review", "in_review", "review_requested", "changes_requested", "approved", "archived"] },
    { id: "requested", label: "Review Requested", minState: ["ready_for_review", "review_requested", "in_review", "changes_requested", "approved", "archived"] },
    { id: "comment", label: "Comment Added", minState: ["in_review", "changes_requested", "approved", "archived"] },
    { id: "changes", label: "Changes Requested", minState: ["changes_requested", "approved", "archived"] },
    { id: "approved", label: "Approved", minState: ["approved", "archived"] },
    { id: "handed_off", label: "Handed Off", minState: ["approved", "archived"] },
  ];

  const stateOrder: ReviewStateId[] = [
    "draft",
    "ready_for_review",
    "review_requested",
    "in_review",
    "changes_requested",
    "approved",
    "archived",
  ];
  const currentIndex = stateOrder.indexOf(state);

  return steps.map((step, index) => {
    const stepIndex =
      step.id === "created"
        ? 0
        : step.id === "requested"
          ? 1
          : step.id === "comment"
            ? 2
            : step.id === "changes"
              ? 3
              : step.id === "approved"
                ? 4
                : 5;

    let detail = "Upcoming in the review timeline.";
    if (step.id === "created") detail = `${record.artifactTitle} created for ${record.missionName}.`;
    if (step.id === "requested" && currentIndex >= 1)
      detail = reviewStateNote(record.artifactTitle, "review_requested");
    if (step.id === "comment" && record.commentCount > 0)
      detail = `${record.commentCount} human review comment(s) on record.`;
    if (step.id === "changes" && state === "changes_requested")
      detail = reviewStateNote(record.artifactTitle, "changes_requested");
    if (step.id === "approved" && (state === "approved" || state === "archived"))
      detail = `${record.artifactTitle} approved for continuity reading—human decision only.`;
    if (step.id === "handed_off" && state === "approved")
      detail = `Handoff consideration may follow stakeholder alignment.`;

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

export function buildReviewOverviewSummary(input: {
  missions: Mission[];
  tasks: Task[];
}): ReviewOverviewSummary {
  const records = buildArtifactReviewRecords({ missions: input.missions, tasks: input.tasks });

  return {
    pendingReviews: records.filter(
      (r) => r.reviewState === "ready_for_review" || r.reviewState === "review_requested"
    ).length,
    inReview: records.filter((r) => r.reviewState === "in_review").length,
    changesRequested: records.filter((r) => r.reviewState === "changes_requested").length,
    approvedArtifacts: records.filter(
      (r) => r.reviewState === "approved" || r.reviewState === "archived"
    ).length,
    advisoryNote:
      "Artifact review overview integrates handoff artifacts for human approval—no automatic accept or reject.",
  };
}

export function buildCeoReviewSummary(input: { missions: Mission[]; tasks: Task[] }) {
  return buildReviewOverviewSummary(input);
}

export function buildCooReviewCoordination(input: {
  missions: Mission[];
  tasks: Task[];
}): CooReviewCoordination {
  const records = buildArtifactReviewRecords({ missions: input.missions, tasks: input.tasks });
  const pending = records.filter(
    (r) =>
      r.reviewState === "ready_for_review" ||
      r.reviewState === "review_requested" ||
      r.reviewState === "in_review"
  );

  const areas = new Map<string, number>();
  for (const r of pending) {
    areas.set(r.ownerRoleLabel, (areas.get(r.ownerRoleLabel) ?? 0) + 1);
  }

  const crossTeamReviewAreas = [...areas.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([role, count]) => `${role} (${count} artifact(s))`);

  return {
    reviewConcentrations: pending.filter((r) => r.reviewState === "in_review").length,
    pendingReviews: pending.length,
    crossTeamReviewAreas,
    advisoryNote:
      "Review coordination highlights concentration areas—COO reads alignment, not automatic approval.",
  };
}

export function buildMissionReviewContext(input: {
  mission: Mission;
  tasks: Task[];
}): MissionReviewContext {
  const records = buildArtifactReviewRecords({
    missions: [input.mission],
    tasks: input.tasks,
  });

  const primary =
    records.find((r) => r.reviewState === "in_review" || r.reviewState === "changes_requested") ??
    records.find(
      (r) => r.reviewState === "ready_for_review" || r.reviewState === "review_requested"
    ) ??
    records[0];

  const pendingReviewCount = records.filter(
    (r) =>
      r.reviewState === "ready_for_review" ||
      r.reviewState === "review_requested" ||
      r.reviewState === "in_review" ||
      r.reviewState === "changes_requested"
  ).length;

  const reviewHistory = records
    .filter((r) => r.reviewCount > 0 || r.commentCount > 0)
    .map((r) => ({
      label: r.artifactTitle,
      state: r.reviewStateLabel,
      at: r.lastReviewedAt ?? r.updatedAt,
    }))
    .slice(0, 6);

  let progressNote = reviewStateNote(
    primary?.artifactTitle ?? "Artifact",
    primary?.reviewState ?? "draft"
  );
  if (primary?.reviewState === "changes_requested") {
    progressNote = "This review contains unresolved feedback.";
  }

  return {
    missionId: input.mission.id,
    missionName: input.mission.name,
    currentArtifact: primary?.artifactTitle ?? "—",
    currentArtifactId: primary?.artifactId ?? "",
    reviewState: primary?.reviewState ?? "draft",
    reviewStateLabel: primary?.reviewStateLabel ?? "Draft",
    reviewHistory,
    pendingReviewCount,
    progressNote,
  };
}

export function getLifecycleReviewSummaryForMission(input: {
  mission: Mission;
  tasks: Task[];
}) {
  const records = buildArtifactReviewRecords({
    missions: [input.mission],
    tasks: input.tasks,
  });
  const pending = records.filter(
    (r) =>
      r.reviewState === "ready_for_review" ||
      r.reviewState === "review_requested" ||
      r.reviewState === "in_review" ||
      r.reviewState === "changes_requested"
  );

  const primary =
    pending.find((r) => r.reviewState === "in_review" || r.reviewState === "changes_requested") ??
    pending[0];

  return {
    currentArtifactReviewState: primary?.reviewStateLabel ?? "—",
    pendingReviewCount: pending.length,
  };
}

export function buildReviewWorkspaceData(input: {
  missions: Mission[];
  tasks: Task[];
  missionId?: string | null;
  reviewStateFilter?: ReviewStateId | null;
  artifactId?: string | null;
}) {
  const records = buildArtifactReviewRecords({
    missions: input.missions,
    tasks: input.tasks,
    missionId: input.missionId,
    reviewStateFilter: input.reviewStateFilter,
  });

  const selectedRecord = input.artifactId
    ? records.find((r) => r.artifactId === input.artifactId)
    : records[0];

  const comments = selectedRecord
    ? getCommentsForArtifact(selectedRecord.artifactId)
    : input.missionId
      ? getCommentsForMission(input.missionId)
      : seededReviewComments;

  const recommendations = buildReviewRecommendations({ records, comments: seededReviewComments });

  const timeline = selectedRecord ? buildReviewTimeline({ record: selectedRecord }) : [];

  return {
    records,
    board: buildReviewBoardRows(records),
    overview: buildReviewOverviewSummary({ missions: input.missions, tasks: input.tasks }),
    timeline,
    comments,
    recommendations,
    selectedRecord,
  };
}
