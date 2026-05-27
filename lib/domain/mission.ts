export interface MissionRecord {
  id: string;
  name: string;
  description: string;
  summary: string;
  status: string;
  health: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export function mapMissionRow(row: {
  id: string;
  name: string;
  description: string;
  summary: string;
  status: string;
  health: string;
  progress: number;
  created_at: string;
  updated_at: string;
}): MissionRecord {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    summary: row.summary,
    status: row.status,
    health: row.health,
    progress: row.progress,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
