import { mapJudgmentRow, type JudgmentRecord } from "@/lib/domain/judgment";
import { db } from "@/lib/server/db/client";

interface ListJudgmentFilters {
  missionId?: string;
  status?: string;
}

interface JudgmentStatusPatch {
  status: string;
  selectedOption?: string | null;
  updatedAt?: string;
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
                , selected_option
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
      selected_option: string | null;
      priority: string;
      created_at: string;
      updated_at: string;
    }>;

    return rows.map(mapJudgmentRow);
  }

  getById(decisionId: string): JudgmentRecord | null {
    const row = db
      .prepare(
        `SELECT id, mission_id, mission_name, title, summary, status, priority, selected_option, created_at, updated_at
         FROM decisions
         WHERE id = ?`
      )
      .get(decisionId) as
      | {
          id: string;
          mission_id: string;
          mission_name: string;
          title: string;
          summary: string;
          status: string;
          priority: string;
          selected_option: string | null;
          created_at: string;
          updated_at: string;
        }
      | undefined;
    return row ? mapJudgmentRow(row) : null;
  }

  updateStatus(decisionId: string, patch: JudgmentStatusPatch): JudgmentRecord | null {
    const existing = this.getById(decisionId);
    if (!existing) return null;
    db.prepare(
      `UPDATE decisions
       SET status = @status,
           selected_option = @selectedOption,
           updated_at = @updatedAt
       WHERE id = @id`
    ).run({
      id: decisionId,
      status: patch.status,
      selectedOption: patch.selectedOption ?? existing.selectedOption,
      updatedAt: patch.updatedAt ?? "Just now",
    });
    return this.getById(decisionId);
  }
}

export const judgmentRepository = new JudgmentRepository();
