import { mapJudgmentRow, type JudgmentRecord } from "@/lib/domain/judgment";
import { db } from "@/lib/server/db/client";

interface ListJudgmentFilters {
  missionId?: string;
  status?: string;
}

export class JudgmentRepository {
  list(filters: ListJudgmentFilters = {}): JudgmentRecord[] {
    const clauses: string[] = [];
    const params: string[] = [];

    if (filters.missionId) {
      clauses.push("mission_id = ?");
      params.push(filters.missionId);
    }
    if (filters.status) {
      clauses.push("status = ?");
      params.push(filters.status);
    }

    const whereSql = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const rows = db
      .prepare(
        `SELECT id, mission_id, mission_name, title, summary, status, priority, created_at, updated_at
         FROM decisions
         ${whereSql}
         ORDER BY updated_at DESC, id DESC`
      )
      .all(...params) as Array<{
      id: string;
      mission_id: string;
      mission_name: string;
      title: string;
      summary: string;
      status: string;
      priority: string;
      created_at: string;
      updated_at: string;
    }>;

    return rows.map(mapJudgmentRow);
  }
}

export const judgmentRepository = new JudgmentRepository();
