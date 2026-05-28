import { agents } from "@/data/mockData";
import { markSyncedAt, withSyncedAt } from "@/lib/services/syncMetadata";
import { normalizeReplayMetadata } from "@/lib/replay-query/replayMetadata";
import type { FeedItemRecord } from "@/lib/domain/feed";
import type { JudgmentRecord } from "@/lib/domain/judgment";
import type { MissionRecord } from "@/lib/domain/mission";
import type { TaskRecord } from "@/lib/domain/task";
import type { Agent, OrganizationFeedItem, Task } from "@/types/productai";
import type { Decision, Mission } from "@/types/productai";

export function mapTaskToCreatePayload(task: Task) {
  const agent = agents.find((a) => a.role === task.assignedTo);
  return {
    title: task.title,
    missionId: task.missionId,
    status: task.status,
    priority: task.priority,
    assignedAgentId: task.assignedAgentId ?? agent?.id ?? "eng-1",
    relatedDecisionId: task.relatedDecisionId ?? null,
    createdFrom: task.createdFrom ?? "manual",
    dependencies: task.dependencies,
  };
}

export function mapTaskPatchPayload(
  task: Task,
  patch: {
    status?: Task["status"];
    assignedAgentId?: string;
    priority?: string | null;
    dependencies?: string[];
    updatedAt?: string;
  }
) {
  return {
    status: patch.status ?? task.status,
    assignedAgentId: patch.assignedAgentId ?? task.assignedAgentId,
    priority: patch.priority ?? task.priority,
    dependencies: patch.dependencies ?? task.dependencies,
    updatedAt: patch.updatedAt ?? "Just now",
  };
}

export function mapFeedItemToCreatePayload(item: Omit<OrganizationFeedItem, "id" | "timestamp">) {
  const metadata = normalizeReplayMetadata(item);
  return {
    missionId: item.missionId,
    taskId: item.taskId ?? null,
    decisionId: item.decisionId ?? null,
    type: item.type,
    status: item.status ?? null,
    message: item.message,
    agentId: item.agentId,
    title: item.title,
    author: item.author,
    authorName: item.authorName,
    governanceCategory: metadata.governanceCategory,
    replayCategory: metadata.replayCategory,
    continuityCategory: metadata.continuityCategory,
    advisoryLevel: metadata.advisoryLevel,
    replayTags: metadata.replayTags,
    replaySeverity: metadata.replaySeverity,
    replaySource: metadata.replaySource,
    decisionAttentionId: item.decisionAttentionId,
    decisionAttentionSeverity: item.decisionAttentionSeverity,
    decisionAttentionCategory: item.decisionAttentionCategory,
    decisionAttentionReason: item.decisionAttentionReason,
    decisionAttentionSource: item.decisionAttentionSource,
    decisionAttentionReplayConfidence: item.decisionAttentionReplayConfidence,
    decisionAttentionContinuityCategory: item.decisionAttentionContinuityCategory,
    decisionAttentionLifecycle: item.decisionAttentionLifecycle,
  };
}

export function mapAgentToAssignedPatch(agent?: Agent) {
  return agent ? { assignedAgentId: agent.id } : {};
}

export function mapMissionRecordToMission(record: MissionRecord, base?: Mission): Mission {
  return {
    ...(base ?? {
      id: record.id,
      name: record.name,
      description: record.description,
      summary: record.summary,
      status: "planning",
      lifecycle: "Requirements",
      progress: 0,
      health: "stable",
      assignedAgents: ["COO", "Architect", "Engineer", "QA"],
      blockers: [],
      recentActivity: "Hydrated from backend.",
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      syncedAt: record.updatedAt,
      requirementsSummary: record.summary,
      architectureSummary: record.summary,
      releaseReadiness: {
        score: 50,
        label: "In progress",
        summary: "Hydrated from backend data.",
        blockers: [],
      },
      relatedBranches: [],
      relatedPullRequests: [],
      memoryInsightIds: [],
      decisionIds: [],
      taskIds: [],
      activityIds: [],
    }),
    id: record.id,
    name: record.name,
    description: record.description,
    summary: record.summary,
    status: (record.status as Mission["status"]) ?? base?.status ?? "planning",
    health: (record.health as Mission["health"]) ?? base?.health ?? "stable",
    progress: record.progress,
    createdAt: record.createdAt ?? base?.createdAt,
    updatedAt: record.updatedAt,
    syncedAt: markSyncedAt(),
  };
}

export function mapTaskRecordToTask(record: TaskRecord, base?: Task): Task {
  return {
    ...(base ?? {
      id: record.id,
      title: record.title,
      missionId: record.missionId,
      missionName: record.missionName,
      status: "active",
      assignedTo: "Engineer",
      assignedAgentId: record.assignedAgentId ?? undefined,
      dependencies: [],
      eta: record.eta,
      progress: 0,
      priority: "medium",
      relatedDecisionId: record.relatedDecisionId ?? undefined,
      createdFrom: "manual",
      updatedAt: record.updatedAt,
      createdAt: record.createdAt,
      syncedAt: record.updatedAt,
      events: [],
    }),
    id: record.id,
    title: record.title,
    missionId: record.missionId,
    missionName: record.missionName,
    status: (record.status as Task["status"]) ?? base?.status ?? "active",
    assignedTo: (record.assignedTo as Task["assignedTo"]) ?? base?.assignedTo ?? "Engineer",
    assignedAgentId: record.assignedAgentId ?? base?.assignedAgentId,
    dependencies: record.dependencies,
    eta: record.eta,
    progress: record.progress,
    priority: (record.priority as Task["priority"]) ?? base?.priority ?? "medium",
    relatedDecisionId: record.relatedDecisionId ?? base?.relatedDecisionId,
    createdFrom: (record.createdFrom as Task["createdFrom"]) ?? base?.createdFrom ?? "manual",
    updatedAt: record.updatedAt,
    createdAt: record.createdAt,
    syncedAt: markSyncedAt(),
  };
}

export function mapFeedRecordToFeedItem(
  record: FeedItemRecord,
  base?: OrganizationFeedItem
): OrganizationFeedItem {
  return {
    ...(base ?? {
      id: record.id,
      type: "implementation",
      author: "COO",
      authorName: record.authorName,
      missionId: record.missionId,
      missionName: record.missionName,
      message: record.message,
      timestamp: record.createdAt,
      createdAt: record.createdAt,
      updatedAt: record.createdAt,
      syncedAt: record.createdAt,
    }),
    id: record.id,
    missionId: record.missionId,
    missionName: record.missionName,
    taskId: record.taskId ?? undefined,
    decisionId: record.decisionId ?? undefined,
    type: (record.type as OrganizationFeedItem["type"]) ?? base?.type ?? "implementation",
    status: (record.status as OrganizationFeedItem["status"]) ?? base?.status,
    author: (record.author as OrganizationFeedItem["author"]) ?? base?.author ?? "COO",
    authorName: record.authorName,
    message: record.message,
    timestamp: record.createdAt,
    createdAt: record.createdAt,
    updatedAt: record.createdAt,
    syncedAt: markSyncedAt(),
    ...normalizeReplayMetadata({
      governanceCategory: (record.governanceCategory as OrganizationFeedItem["governanceCategory"]) ?? base?.governanceCategory,
      replayCategory: (record.replayCategory as OrganizationFeedItem["replayCategory"]) ?? base?.replayCategory,
      continuityCategory: (record.continuityCategory as OrganizationFeedItem["continuityCategory"]) ?? base?.continuityCategory,
      advisoryLevel: (record.advisoryLevel as OrganizationFeedItem["advisoryLevel"]) ?? base?.advisoryLevel,
      replayTags: record.replayTags ?? base?.replayTags,
      replaySeverity: (record.replaySeverity as OrganizationFeedItem["replaySeverity"]) ?? base?.replaySeverity,
      replaySource: (record.replaySource as OrganizationFeedItem["replaySource"]) ?? base?.replaySource,
    }),
    decisionAttentionId: record.decisionAttentionId ?? base?.decisionAttentionId,
    decisionAttentionSeverity:
      (record.decisionAttentionSeverity as OrganizationFeedItem["decisionAttentionSeverity"]) ??
      base?.decisionAttentionSeverity,
    decisionAttentionCategory: record.decisionAttentionCategory ?? base?.decisionAttentionCategory,
    decisionAttentionReason: record.decisionAttentionReason ?? base?.decisionAttentionReason,
    decisionAttentionSource: record.decisionAttentionSource ?? base?.decisionAttentionSource,
    decisionAttentionReplayConfidence:
      (record.decisionAttentionReplayConfidence as OrganizationFeedItem["decisionAttentionReplayConfidence"]) ??
      base?.decisionAttentionReplayConfidence,
    decisionAttentionContinuityCategory:
      (record.decisionAttentionContinuityCategory as OrganizationFeedItem["decisionAttentionContinuityCategory"]) ??
      base?.decisionAttentionContinuityCategory,
    decisionAttentionLifecycle:
      (record.decisionAttentionLifecycle as OrganizationFeedItem["decisionAttentionLifecycle"]) ??
      base?.decisionAttentionLifecycle,
  };
}

export function mapJudgmentRecordToDecision(record: JudgmentRecord, base?: Decision): Decision {
  return {
    ...(base ?? {
      id: record.id,
      title: record.title,
      relatedMissionId: record.missionId,
      missionName: record.missionName,
      summary: record.summary,
      optionA: { label: "Option A", description: "See decision context." },
      optionB: { label: "Option B", description: "See decision context." },
      risks: [],
      costImpact: "TBD",
      timeImpact: "TBD",
      teamOpinions: [],
      status: "pending",
      priority: "medium",
      relatedTaskIds: [],
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      syncedAt: record.updatedAt,
    }),
    id: record.id,
    title: record.title,
    relatedMissionId: record.missionId,
    missionName: record.missionName,
    summary: record.summary,
    status: (record.status as Decision["status"]) ?? base?.status ?? "pending",
    priority: (record.priority as Decision["priority"]) ?? base?.priority ?? "medium",
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    syncedAt: markSyncedAt(),
  };
}

/** Apply syncedAt when merging hydrated remote payloads into store-ready entities. */
export function withHydratedSyncMetadata<T extends { syncedAt?: string }>(entity: T): T {
  return withSyncedAt(entity);
}
