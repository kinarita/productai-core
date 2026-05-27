export interface TaskRecord {
  id: string;
  missionId: string;
  missionName: string;
  relatedDecisionId: string | null;
  title: string;
  status: string;
  priority: string | null;
  createdFrom: string | null;
  progress: number;
  eta: string;
  assignedTo: string;
  dependencies: string[];
  createdAt: string;
  updatedAt: string;
}

export function parseDependencies(dependenciesJson: string): string[] {
  try {
    const parsed = JSON.parse(dependenciesJson);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function mapTaskRow(row: {
  id: string;
  mission_id: string;
  mission_name: string;
  related_decision_id: string | null;
  title: string;
  status: string;
  priority: string | null;
  created_from: string | null;
  progress: number;
  eta: string;
  assigned_to: string;
  dependencies_json: string;
  created_at: string;
  updated_at: string;
}): TaskRecord {
  return {
    id: row.id,
    missionId: row.mission_id,
    missionName: row.mission_name,
    relatedDecisionId: row.related_decision_id,
    title: row.title,
    status: row.status,
    priority: row.priority,
    createdFrom: row.created_from,
    progress: row.progress,
    eta: row.eta,
    assignedTo: row.assigned_to,
    dependencies: parseDependencies(row.dependencies_json),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
