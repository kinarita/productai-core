import { mapMissionRow, type MissionRecord } from "@/lib/domain/mission";
import { db } from "@/lib/server/db/client";

export class MissionRepository {
  list(): MissionRecord[] {
    const rows = db
      .prepare(
        `SELECT id, name, description, summary, status, health, progress, created_at, updated_at
         FROM missions
         ORDER BY updated_at DESC, id ASC`
      )
      .all() as Array<{
      id: string;
      name: string;
      description: string;
      summary: string;
      status: string;
      health: string;
      progress: number;
      created_at: string;
      updated_at: string;
    }>;

    return rows.map(mapMissionRow);
  }

  getById(id: string): MissionRecord | null {
    const row = db
      .prepare(
        `SELECT id, name, description, summary, status, health, progress, created_at, updated_at
         FROM missions WHERE id = ?`
      )
      .get(id) as
      | {
          id: string;
          name: string;
          description: string;
          summary: string;
          status: string;
          health: string;
          progress: number;
          created_at: string;
          updated_at: string;
        }
      | undefined;
    return row ? mapMissionRow(row) : null;
  }
}

export const missionRepository = new MissionRepository();
