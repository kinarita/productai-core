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
}): FeedItemRecord {
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
  };
}
