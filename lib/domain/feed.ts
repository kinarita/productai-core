import { validateDecisionAttentionMetadata } from "@/lib/replay-query/decisionAttentionValidation";
import { validateReplayMetadata } from "@/lib/replay-query/replayValidation";

export interface FeedItemRecord {
  id: string;
  missionId: string;
  missionName: string;
  taskId: string | null;
  decisionId: string | null;
  type: string;
  status: string | null;
  author: string;
  authorName: string;
  message: string;
  createdAt: string;
  governanceCategory?: string | null;
  replayCategory?: string | null;
  continuityCategory?: string | null;
  advisoryLevel?: string | null;
  replaySeverity?: string | null;
  replaySource?: string | null;
  replayTags?: string[] | null;
  metadata?: Record<string, unknown> | null;
  decisionAttentionId?: string | null;
  decisionAttentionSeverity?: string | null;
  decisionAttentionCategory?: string | null;
  decisionAttentionReason?: string | null;
  decisionAttentionSource?: string | null;
  decisionAttentionReplayConfidence?: string | null;
  decisionAttentionContinuityCategory?: string | null;
  decisionAttentionLifecycle?: string | null;
}

export const FEED_ITEM_SELECT_COLUMNS = `
  id, mission_id, mission_name, task_id, decision_id, type, status, author, author_name, message,
  governance_category, replay_category, continuity_category, advisory_level, replay_severity, replay_source,
  replay_tags_json, metadata_json,
  decision_attention_id, decision_attention_severity, decision_attention_category, decision_attention_reason,
  decision_attention_source, decision_attention_replay_confidence, decision_attention_continuity_category,
  decision_attention_lifecycle,
  created_at
`;

export type FeedItemDbRow = {
  id: string;
  mission_id: string;
  mission_name: string;
  task_id: string | null;
  decision_id: string | null;
  type: string;
  status: string | null;
  author: string;
  author_name: string;
  message: string;
  created_at: string;
  governance_category?: string | null;
  replay_category?: string | null;
  continuity_category?: string | null;
  advisory_level?: string | null;
  replay_severity?: string | null;
  replay_source?: string | null;
  replay_tags_json?: string | null;
  metadata_json?: string | null;
  decision_attention_id?: string | null;
  decision_attention_severity?: string | null;
  decision_attention_category?: string | null;
  decision_attention_reason?: string | null;
  decision_attention_source?: string | null;
  decision_attention_replay_confidence?: string | null;
  decision_attention_continuity_category?: string | null;
  decision_attention_lifecycle?: string | null;
};

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function mapFeedItemRow(row: FeedItemDbRow): FeedItemRecord {
  const replayTags = safeJsonParse<string[]>(row.replay_tags_json ?? null);
  const metadata = asRecord(safeJsonParse<unknown>(row.metadata_json ?? null));
  const validated = validateReplayMetadata({
    governanceCategory: row.governance_category ?? undefined,
    replayCategory: row.replay_category ?? undefined,
    continuityCategory: row.continuity_category ?? undefined,
    advisoryLevel: row.advisory_level ?? undefined,
    replaySeverity: row.replay_severity ?? undefined,
    replaySource: row.replay_source ?? undefined,
    replayTags: replayTags ?? undefined,
  });
  const attention = validateDecisionAttentionMetadata({
    decisionAttentionId: row.decision_attention_id ?? undefined,
    decisionAttentionSeverity: row.decision_attention_severity ?? undefined,
    decisionAttentionCategory: row.decision_attention_category ?? undefined,
    decisionAttentionReason: row.decision_attention_reason ?? undefined,
    decisionAttentionSource: row.decision_attention_source ?? undefined,
    decisionAttentionReplayConfidence: row.decision_attention_replay_confidence ?? undefined,
    decisionAttentionContinuityCategory: row.decision_attention_continuity_category ?? undefined,
    decisionAttentionLifecycle: row.decision_attention_lifecycle ?? undefined,
  });
  return {
    id: row.id,
    missionId: row.mission_id,
    missionName: row.mission_name,
    taskId: row.task_id,
    decisionId: row.decision_id,
    type: row.type,
    status: row.status,
    author: row.author,
    authorName: row.author_name,
    message: row.message,
    createdAt: row.created_at,
    governanceCategory: validated.governanceCategory,
    replayCategory: validated.replayCategory,
    continuityCategory: validated.continuityCategory,
    advisoryLevel: validated.advisoryLevel,
    replaySeverity: validated.replaySeverity,
    replaySource: validated.replaySource,
    replayTags: validated.replayTags,
    metadata,
    decisionAttentionId: attention.decisionAttentionId ?? null,
    decisionAttentionSeverity: attention.decisionAttentionSeverity ?? null,
    decisionAttentionCategory: attention.decisionAttentionCategory ?? null,
    decisionAttentionReason: attention.decisionAttentionReason ?? null,
    decisionAttentionSource: attention.decisionAttentionSource ?? null,
    decisionAttentionReplayConfidence: attention.decisionAttentionReplayConfidence ?? null,
    decisionAttentionContinuityCategory: attention.decisionAttentionContinuityCategory ?? null,
    decisionAttentionLifecycle: attention.decisionAttentionLifecycle ?? null,
  };
}
