import { mapFeedItemRow, type FeedItemRecord } from "@/lib/domain/feed";
import { db } from "@/lib/server/db/client";

interface ListFeedFilters {
  missionId?: string;
  taskId?: string;
  type?: string;
  status?: string;
  governanceCategory?: string;
  replayCategory?: string;
  continuityCategory?: string;
  replaySeverity?: string;
  replaySource?: string;
}

interface CreateFeedInput {
  id: string;
  missionId: string;
  missionName: string;
  taskId?: string | null;
  decisionId?: string | null;
  type: string;
  status?: string | null;
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

export class FeedRepository {
  private ensureFeedMetadataColumns() {
    const columns = db.prepare(`PRAGMA table_info(feed_items)`).all() as Array<{ name: string }>;
    const ensure = (column: string, definition: string) => {
      if (!columns.some((c) => c.name === column)) {
        db.exec(`ALTER TABLE feed_items ADD COLUMN ${column} ${definition}`);
      }
    };
    ensure("governance_category", "TEXT");
    ensure("replay_category", "TEXT");
    ensure("continuity_category", "TEXT");
    ensure("advisory_level", "TEXT");
    ensure("replay_severity", "TEXT");
    ensure("replay_source", "TEXT");
    ensure("replay_tags_json", "TEXT");
    ensure("metadata_json", "TEXT");
  }

  list(filters: ListFeedFilters = {}): FeedItemRecord[] {
    this.ensureFeedMetadataColumns();
    const clauses: string[] = [];
    const params: string[] = [];

    if (filters.missionId) {
      clauses.push("mission_id = ?");
      params.push(filters.missionId);
    }
    if (filters.taskId) {
      clauses.push("task_id = ?");
      params.push(filters.taskId);
    }
    if (filters.type) {
      clauses.push("type = ?");
      params.push(filters.type);
    }
    if (filters.status) {
      clauses.push("status = ?");
      params.push(filters.status);
    }
    if (filters.governanceCategory) {
      clauses.push("governance_category = ?");
      params.push(filters.governanceCategory);
    }
    if (filters.replayCategory) {
      clauses.push("replay_category = ?");
      params.push(filters.replayCategory);
    }
    if (filters.continuityCategory) {
      clauses.push("continuity_category = ?");
      params.push(filters.continuityCategory);
    }
    if (filters.replaySeverity) {
      clauses.push("replay_severity = ?");
      params.push(filters.replaySeverity);
    }
    if (filters.replaySource) {
      clauses.push("replay_source = ?");
      params.push(filters.replaySource);
    }

    const whereSql = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const rows = db
      .prepare(
        `SELECT id, mission_id, mission_name, task_id, decision_id, type, status, author, author_name, message,
                governance_category, replay_category, continuity_category, advisory_level, replay_severity, replay_source,
                replay_tags_json, metadata_json, created_at
         FROM feed_items
         ${whereSql}
         ORDER BY created_at DESC, id DESC`
      )
      .all(...params) as Array<{
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
      governance_category: string | null;
      replay_category: string | null;
      continuity_category: string | null;
      advisory_level: string | null;
      replay_severity: string | null;
      replay_source: string | null;
      replay_tags_json: string | null;
      metadata_json: string | null;
      created_at: string;
    }>;

    return rows.map(mapFeedItemRow);
  }

  getById(feedId: string): FeedItemRecord | null {
    this.ensureFeedMetadataColumns();
    const row = db
      .prepare(
        `SELECT id, mission_id, mission_name, task_id, decision_id, type, status, author, author_name, message,
                governance_category, replay_category, continuity_category, advisory_level, replay_severity, replay_source,
                replay_tags_json, metadata_json, created_at
         FROM feed_items
         WHERE id = ?`
      )
      .get(feedId) as
      | {
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
          governance_category: string | null;
          replay_category: string | null;
          continuity_category: string | null;
          advisory_level: string | null;
          replay_severity: string | null;
          replay_source: string | null;
          replay_tags_json: string | null;
          metadata_json: string | null;
          created_at: string;
        }
      | undefined;
    return row ? mapFeedItemRow(row) : null;
  }

  create(input: CreateFeedInput): FeedItemRecord {
    this.ensureFeedMetadataColumns();
    db.prepare(
      `INSERT INTO feed_items (
         id, mission_id, mission_name, task_id, decision_id, type, status, author, author_name, message,
         governance_category, replay_category, continuity_category, advisory_level, replay_severity, replay_source,
         replay_tags_json, metadata_json, created_at
       ) VALUES (
         @id, @missionId, @missionName, @taskId, @decisionId, @type, @status, @author, @authorName, @message,
         @governanceCategory, @replayCategory, @continuityCategory, @advisoryLevel, @replaySeverity, @replaySource,
         @replayTagsJson, @metadataJson, @createdAt
       )`
    ).run({
      id: input.id,
      missionId: input.missionId,
      missionName: input.missionName,
      taskId: input.taskId ?? null,
      decisionId: input.decisionId ?? null,
      type: input.type,
      status: input.status ?? null,
      author: input.author,
      authorName: input.authorName,
      message: input.message,
      governanceCategory: input.governanceCategory ?? null,
      replayCategory: input.replayCategory ?? null,
      continuityCategory: input.continuityCategory ?? null,
      advisoryLevel: input.advisoryLevel ?? null,
      replaySeverity: input.replaySeverity ?? null,
      replaySource: input.replaySource ?? null,
      replayTagsJson: JSON.stringify(input.replayTags ?? []),
      metadataJson: input.metadata ? JSON.stringify(input.metadata) : null,
      createdAt: input.createdAt,
    });

    return this.getById(input.id) as FeedItemRecord;
  }
}

export const feedRepository = new FeedRepository();
