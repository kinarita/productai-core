export interface JudgmentRecord {
  id: string;
  missionId: string;
  missionName: string;
  title: string;
  summary: string;
  status: string;
  selectedOption: string | null;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

export function mapJudgmentRow(row: {
  id: string;
  mission_id: string;
  mission_name: string;
  title: string;
  summary: string;
  status: string;
  selected_option: string | null;
  priority: string;
  created_at: string;
  updated_at: string;
}): JudgmentRecord {
  return {
    id: row.id,
    missionId: row.mission_id,
    missionName: row.mission_name,
    title: row.title,
    summary: row.summary,
    status: row.status,
    selectedOption: row.selected_option,
    priority: row.priority,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
