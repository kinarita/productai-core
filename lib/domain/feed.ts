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
}

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function mapFeedItemRow(row: {
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
}): FeedItemRecord {
  const replayTags = safeJsonParse<string[]>(row.replay_tags_json ?? null);
  const metadata = safeJsonParse<Record<string, unknown>>(row.metadata_json ?? null);
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
    governanceCategory: row.governance_category ?? null,
    replayCategory: row.replay_category ?? null,
    continuityCategory: row.continuity_category ?? null,
    advisoryLevel: row.advisory_level ?? null,
    replaySeverity: row.replay_severity ?? null,
    replaySource: row.replay_source ?? null,
    replayTags,
    metadata,
  };
}
