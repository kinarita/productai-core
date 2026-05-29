import type { Mission, OrganizationFeedItem, Task } from "@/types/productai";
import type { HandoffRoleId } from "@/lib/handoff/handoffWorkflow";
import { handoffRoleLabel } from "@/lib/handoff/handoffWorkflow";
import {
  buildArtifactReviewRecord,
  buildArtifactReviewRecords,
  buildReviewTimeline,
} from "@/lib/review/reviewAnalysis";
import type { ReviewTargetTypeId } from "@/lib/review/artifactReview";
import { reviewTargetDefinitions } from "@/lib/review/artifactReview";
import { reviewStateLabel } from "@/lib/review/reviewStatus";
import type { ReviewStateId } from "@/lib/review/reviewStatus";
import {
  buildCrossRoleReviewRecord,
  crossRoleReviewArtifactTypes,
  type CrossRoleReviewRecord,
} from "@/lib/cross-review/crossRoleReviewRecord";
import { crossRoleReviewAdvisoryNote, crossReviewWorkspaceHref } from "@/lib/cross-review/crossRoleReviewWorkspace";
import { reviewDependencyForType } from "@/lib/cross-review/reviewDependencies";
import { artifactLineageHref } from "@/lib/lineage/artifactLineageWorkspace";
export interface CrossReviewOverviewSummary {
  totalReviews: number;
  pendingReviews: number;
  inReview: number;
  changesRequested: number;
  approved: number;
  advisoryNote: string;
}

export interface CrossReviewBoardRow {
  reviewId: string;
  artifact: string;
  artifactType: string;
  artifactTypeId: ReviewTargetTypeId;
  mission: string;
  missionId: string;
  artifactId: string;
  ownerRole: string;
  reviewerRole: string;
  reviewState: string;
  reviewStateId: ReviewStateId;
  lastUpdated: string;
}

export type MatrixRoleId =
  | "product_planner"
  | "director"
  | "architect"
  | "designer"
  | "developer"
  | "qa_reviewer";

export const matrixRoles: { id: MatrixRoleId; label: string }[] = [
  { id: "product_planner", label: "Planner" },
  { id: "director", label: "Director" },
  { id: "architect", label: "Architect" },
  { id: "designer", label: "Designer" },
  { id: "developer", label: "Developer" },
  { id: "qa_reviewer", label: "QA" },
];

export interface RoleReviewMatrixCell {
  requested: number;
  inProgress: number;
  completed: number;
}

export interface CrossReviewInspectorView {
  artifactSummary: string;
  artifactTitle: string;
  reviewState: string;
  reviewHistory: Array<{ label: string; detail: string }>;
  relatedFeedEvents: Array<{ id: string; label: string; message: string; timestamp: string }>;
  relatedWorkspaces: Array<{ label: string; href: string }>;
  lineageHref: string;
}

export interface CrossReviewTraceabilityView {
  requestedBy: string;
  reviewedBy: string;
  relatedRole: string;
  relatedArtifact: string;
  relatedFeedEvents: string[];
  advisoryNote: string;
}

export interface ReviewConcentrationView {
  byRole: Array<{ role: string; count: number }>;
  byMission: Array<{ missionId: string; missionName: string; count: number; note: string }>;
  byArtifactType: Array<{ type: string; count: number }>;
  advisoryNote: string;
}

export interface MissionCrossReviewContext {
  missionId: string;
  missionName: string;
  activeReviews: number;
  pendingReviews: number;
  relatedArtifacts: string[];
  reviewHistory: Array<{ label: string; state: string; at: string }>;
  workspaceHref: string;
  progressNote: string;
}

export interface HandoffReviewContextItem {
  missionId: string;
  missionName: string;
  handoffReview: string;
  approvalContext: string;
  relatedArtifact: string;
  reviewHref: string;
}

const reviewWorkspaceFeedTypes = new Set([
  "artifact_review_requested",
  "artifact_approved",
  "artifact_returned",
  "artifact_changes_requested",
  "product_brief_review_requested",
  "director_plan_review_requested",
  "architecture_review_requested",
  "design_review_requested",
  "development_review_requested",
  "qa_review_requested",
  "review_workspace_created",
  "review_context_updated",
  "review_traceability_updated",
  "review_snapshot",
]);

function isCrossRoleType(typeId: ReviewTargetTypeId): boolean {
  return crossRoleReviewArtifactTypes.includes(typeId);
}

function isPending(state: ReviewStateId): boolean {
  return state === "ready_for_review" || state === "review_requested";
}

function isActive(state: ReviewStateId): boolean {
  return state === "in_review" || state === "changes_requested";
}

export function buildCrossRoleReviewRecords(input: {
  missions: Mission[];
  tasks: Task[];
  missionId?: string | null;
  roleFilter?: HandoffRoleId | null;
  stateFilter?: ReviewStateId | null;
  artifactTypeFilter?: ReviewTargetTypeId | null;
}): CrossRoleReviewRecord[] {
  const artifactRecords = buildArtifactReviewRecords({
    missions: input.missions,
    tasks: input.tasks,
    missionId: input.missionId,
  });

  return artifactRecords
    .filter((r) => isCrossRoleType(r.artifactType))
    .filter((r) => !input.roleFilter || r.ownerRole === input.roleFilter)
    .filter((r) => !input.stateFilter || r.reviewState === input.stateFilter)
    .filter((r) => !input.artifactTypeFilter || r.artifactType === input.artifactTypeFilter)
    .map(buildCrossRoleReviewRecord);
}

export function buildCrossReviewOverview(input: {
  missions: Mission[];
  tasks: Task[];
}): CrossReviewOverviewSummary {
  const records = buildCrossRoleReviewRecords({ missions: input.missions, tasks: input.tasks });

  return {
    totalReviews: records.length,
    pendingReviews: records.filter((r) => isPending(r.reviewState)).length,
    inReview: records.filter((r) => r.reviewState === "in_review").length,
    changesRequested: records.filter((r) => r.reviewState === "changes_requested").length,
    approved: records.filter(
      (r) => r.reviewState === "approved" || r.reviewState === "archived"
    ).length,
    advisoryNote: crossRoleReviewAdvisoryNote,
  };
}

export function buildCeoCrossReviewSummary(input: { missions: Mission[]; tasks: Task[] }) {
  const overview = buildCrossReviewOverview(input);
  const records = buildCrossRoleReviewRecords({ missions: input.missions, tasks: input.tasks });
  const active = records.filter(
    (r) => isPending(r.reviewState) || isActive(r.reviewState)
  ).length;
  const concentrations = records.filter((r) => isActive(r.reviewState)).length;

  return {
    pendingReviews: overview.pendingReviews,
    activeReviews: active,
    approvedReviews: overview.approved,
    reviewConcentrations: concentrations,
    advisoryNote: overview.advisoryNote,
  };
}

export function buildCrossReviewBoardRows(
  records: CrossRoleReviewRecord[],
  missions: Mission[]
): CrossReviewBoardRow[] {
  return records.map((r) => {
    const title =
      reviewTargetDefinitions.find((t) => t.id === r.artifactType)?.title ?? r.artifactType;

    return {
      reviewId: r.reviewId,
      artifact: title,
      artifactType: title,
      artifactTypeId: r.artifactType,
      mission:
        missions.find((m) => m.id === r.missionId)?.name ?? r.missionId,
      missionId: r.missionId,
      artifactId: r.artifactId,
      ownerRole: handoffRoleLabel(r.ownerRole),
      reviewerRole: handoffRoleLabel(r.reviewerRole),
      reviewState: reviewStateLabel(r.reviewState),
      reviewStateId: r.reviewState,
      lastUpdated: r.updatedAt,
    };
  });
}

export function buildRoleReviewMatrix(
  records: CrossRoleReviewRecord[]
): Record<MatrixRoleId, RoleReviewMatrixCell> {
  const init = (): RoleReviewMatrixCell => ({
    requested: 0,
    inProgress: 0,
    completed: 0,
  });

  const matrix = Object.fromEntries(
    matrixRoles.map((r) => [r.id, init()])
  ) as Record<MatrixRoleId, RoleReviewMatrixCell>;

  for (const r of records) {
    const role = r.ownerRole as MatrixRoleId;
    if (!matrix[role]) continue;
    if (isPending(r.reviewState)) matrix[role].requested += 1;
    else if (isActive(r.reviewState)) matrix[role].inProgress += 1;
    else if (r.reviewState === "approved" || r.reviewState === "archived")
      matrix[role].completed += 1;
  }

  return matrix;
}

export function buildCrossReviewInspector(input: {
  mission: Mission;
  tasks: Task[];
  feedItems: OrganizationFeedItem[];
  record: CrossRoleReviewRecord;
}): CrossReviewInspectorView {
  const artifactRecord = buildArtifactReviewRecord({
    mission: input.mission,
    typeId: input.record.artifactType,
    tasks: input.tasks,
  });
  const timeline = buildReviewTimeline({ record: artifactRecord });

  const relatedFeed = input.feedItems
    .filter(
      (f) =>
        f.missionId === input.mission.id &&
        (reviewWorkspaceFeedTypes.has(f.type) ||
          f.type.includes("review") ||
          f.type.includes("brief"))
    )
    .slice(0, 5)
    .map((f) => ({
      id: f.id,
      label: f.type.replaceAll("_", " "),
      message: f.message,
      timestamp: f.timestamp,
    }));

  const target = reviewTargetDefinitions.find((t) => t.id === input.record.artifactType)!;

  return {
    artifactTitle: target.title,
    artifactSummary: artifactRecord.summary,
    reviewState: reviewStateLabel(input.record.reviewState),
    reviewHistory: timeline.map((t) => ({ label: t.label, detail: t.detail })),
    relatedFeedEvents: relatedFeed,
    relatedWorkspaces: [
      {
        label: "Artifact Review",
        href: `/artifact-review?mission=${input.mission.id}&artifact=${input.record.artifactId}`,
      },
      {
        label: "Artifact Lineage",
        href: artifactLineageHref({
          missionId: input.mission.id,
          artifactId: input.record.artifactId,
        }),
      },
      {
        label: "Team Handoff",
        href: `/team-handoff?mission=${input.mission.id}`,
      },
      { label: "Mission Detail", href: `/missions/${input.mission.id}` },
    ],
    lineageHref: artifactLineageHref({
      missionId: input.mission.id,
      artifactId: input.record.artifactId,
    }),
  };
}

export function buildCrossReviewTraceability(input: {
  record: CrossRoleReviewRecord;
  feedItems: OrganizationFeedItem[];
}): CrossReviewTraceabilityView {
  const feed = input.feedItems
    .filter((f) => f.missionId === input.record.missionId)
    .filter((f) => reviewWorkspaceFeedTypes.has(f.type) || f.type.includes("review"))
    .slice(0, 4)
    .map((f) => `${f.type.replaceAll("_", " ")}: ${f.message}`);

  const artifactTitle =
    reviewTargetDefinitions.find((t) => t.id === input.record.artifactType)?.title ??
    input.record.artifactType;

  return {
    requestedBy: handoffRoleLabel(input.record.ownerRole),
    reviewedBy: handoffRoleLabel(input.record.reviewerRole),
    relatedRole: handoffRoleLabel(input.record.ownerRole),
    relatedArtifact: artifactTitle,
    relatedFeedEvents: feed.length > 0 ? feed : ["No review feed events in view for this artifact."],
    advisoryNote:
      "Traceability records human review activity for accountability—no automatic approval.",
  };
}

export function buildReviewConcentration(input: {
  missions: Mission[];
  tasks: Task[];
}): ReviewConcentrationView {
  const records = buildCrossRoleReviewRecords({ missions: input.missions, tasks: input.tasks });
  const active = records.filter((r) => isPending(r.reviewState) || isActive(r.reviewState));

  const byRole = new Map<string, number>();
  const byMission = new Map<string, { name: string; count: number }>();
  const byType = new Map<string, number>();

  for (const r of active) {
    const owner = handoffRoleLabel(r.ownerRole);
    byRole.set(owner, (byRole.get(owner) ?? 0) + 1);
    const mission = input.missions.find((m) => m.id === r.missionId);
    const existing = byMission.get(r.missionId) ?? {
      name: mission?.name ?? r.missionId,
      count: 0,
    };
    existing.count += 1;
    byMission.set(r.missionId, existing);
    const typeTitle =
      reviewTargetDefinitions.find((t) => t.id === r.artifactType)?.title ?? r.artifactType;
    byType.set(typeTitle, (byType.get(typeTitle) ?? 0) + 1);
  }

  return {
    byRole: [...byRole.entries()]
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count),
    byMission: [...byMission.entries()].map(([missionId, v]) => ({
      missionId,
      missionName: v.name,
      count: v.count,
      note:
        v.count >= 3
          ? "This mission currently contains several active review activities."
          : v.count >= 2
            ? "This mission has multiple review activities in view."
            : "Review activity visible for continuity reading.",
    })),
    byArtifactType: [...byType.entries()]
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count),
    advisoryNote:
      "Concentration notes are descriptive only—no automatic prioritization or routing.",
  };
}

export function buildMissionCrossReviewContext(input: {
  mission: Mission;
  tasks: Task[];
}): MissionCrossReviewContext {
  const records = buildCrossRoleReviewRecords({
    missions: [input.mission],
    tasks: input.tasks,
  });

  const pending = records.filter((r) => isPending(r.reviewState));
  const active = records.filter((r) => isActive(r.reviewState));

  const reviewHistory = records
    .filter((r) => r.reviewState !== "draft")
    .map((r) => ({
      label:
        reviewTargetDefinitions.find((t) => t.id === r.artifactType)?.title ?? r.artifactType,
      state: reviewStateLabel(r.reviewState),
      at: r.updatedAt,
    }))
    .slice(0, 8);

  return {
    missionId: input.mission.id,
    missionName: input.mission.name,
    activeReviews: active.length,
    pendingReviews: pending.length,
    relatedArtifacts: records.map(
      (r) =>
        reviewTargetDefinitions.find((t) => t.id === r.artifactType)?.title ?? r.artifactType
    ),
    reviewHistory,
    workspaceHref: crossReviewWorkspaceHref({ missionId: input.mission.id }),
    progressNote:
      "Cross-role review context shows pending and active reviews—human approval required for all transitions.",
  };
}

export function buildHandoffReviewContextItems(input: {
  missions: Mission[];
  tasks: Task[];
}): HandoffReviewContextItem[] {
  return input.missions
    .filter((m) => m.status === "active" || m.status === "planning")
    .map((mission) => {
      const records = buildCrossRoleReviewRecords({
        missions: [mission],
        tasks: input.tasks,
      });
      const primary =
        records.find((r) => isActive(r.reviewState)) ??
        records.find((r) => isPending(r.reviewState)) ??
        records[0];

      const artifactTitle = primary
        ? (reviewTargetDefinitions.find((t) => t.id === primary.artifactType)?.title ??
          primary.artifactType)
        : "—";

      return {
        missionId: mission.id,
        missionName: mission.name,
        handoffReview: primary
          ? `${artifactTitle} — ${reviewStateLabel(primary.reviewState)}`
          : "No cross-role review in view",
        approvalContext: primary
          ? `Reviewer: ${handoffRoleLabel(primary.reviewerRole)} — display only, no auto approval`
          : "Awaiting artifact review context",
        relatedArtifact: artifactTitle,
        reviewHref: primary
          ? crossReviewWorkspaceHref({
              missionId: mission.id,
              artifactId: primary.artifactId,
            })
          : crossReviewWorkspaceHref({ missionId: mission.id }),
      };
    });
}

export function buildCrossReviewWorkspaceData(input: {
  missions: Mission[];
  tasks: Task[];
  feedItems: OrganizationFeedItem[];
  missionId?: string | null;
  artifactId?: string | null;
  reviewId?: string | null;
  roleFilter?: HandoffRoleId | null;
  stateFilter?: ReviewStateId | null;
  artifactTypeFilter?: ReviewTargetTypeId | null;
}) {
  const records = buildCrossRoleReviewRecords({
    missions: input.missions,
    tasks: input.tasks,
    missionId: input.missionId,
    roleFilter: input.roleFilter,
    stateFilter: input.stateFilter,
    artifactTypeFilter: input.artifactTypeFilter,
  });

  const selected =
    (input.reviewId && records.find((r) => r.reviewId === input.reviewId)) ||
    (input.artifactId && records.find((r) => r.artifactId === input.artifactId)) ||
    records[0] ||
    null;

  const selectedMission = selected
    ? input.missions.find((m) => m.id === selected.missionId) ?? null
    : input.missionId
      ? input.missions.find((m) => m.id === input.missionId) ?? null
      : null;

  const inspector =
    selectedMission && selected
      ? buildCrossReviewInspector({
          mission: selectedMission,
          tasks: input.tasks,
          feedItems: input.feedItems,
          record: selected,
        })
      : null;

  const traceability = selected
    ? buildCrossReviewTraceability({ record: selected, feedItems: input.feedItems })
    : null;

  const dependency = selected
    ? reviewDependencyForType(selected.artifactType)
    : null;

  return {
    records,
    board: buildCrossReviewBoardRows(records, input.missions),
    overview: buildCrossReviewOverview({ missions: input.missions, tasks: input.tasks }),
    matrix: buildRoleReviewMatrix(records),
    concentration: buildReviewConcentration({
      missions: input.missions,
      tasks: input.tasks,
    }),
    selected,
    inspector,
    traceability,
    dependency,
    handoffReviewItems: buildHandoffReviewContextItems({
      missions: input.missions,
      tasks: input.tasks,
    }),
    progressNote: selected
      ? `${reviewTargetDefinitions.find((t) => t.id === selected.artifactType)?.title ?? "Artifact"} — ${reviewStateLabel(selected.reviewState)}`
      : records.length === 0
        ? "No cross-role reviews match the current filters."
        : "Select a review row to inspect traceability and lineage links.",
  };
}
