import {
  FEED_ITEM_SELECT_COLUMNS,
  mapFeedItemRow,
  type FeedItemDbRow,
  type FeedItemRecord,
} from "@/lib/domain/feed";
import {
  coerceGovernanceAttentionFilter,
  validateDecisionAttentionMetadata,
} from "@/lib/replay-query/decisionAttentionValidation";
import { validateReplayMetadata } from "@/lib/replay-query/replayValidation";
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
  governanceAttention?: string;
  decisionAttentionId?: string;
  decisionAttentionSeverity?: string;
  decisionAttentionLifecycle?: string;
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
  decisionAttentionId?: string | null;
  decisionAttentionSeverity?: string | null;
  decisionAttentionCategory?: string | null;
  decisionAttentionReason?: string | null;
  decisionAttentionSource?: string | null;
  decisionAttentionReplayConfidence?: string | null;
  decisionAttentionContinuityCategory?: string | null;
  decisionAttentionLifecycle?: string | null;
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
    ensure("decision_attention_id", "TEXT");
    ensure("decision_attention_severity", "TEXT");
    ensure("decision_attention_category", "TEXT");
    ensure("decision_attention_reason", "TEXT");
    ensure("decision_attention_source", "TEXT");
    ensure("decision_attention_replay_confidence", "TEXT");
    ensure("decision_attention_continuity_category", "TEXT");
    ensure("decision_attention_lifecycle", "TEXT");
    db.exec(
      `CREATE INDEX IF NOT EXISTS idx_feed_decision_attention_lifecycle ON feed_items (decision_attention_lifecycle, created_at DESC)`
    );
    db.exec(
      `CREATE INDEX IF NOT EXISTS idx_feed_decision_attention_id ON feed_items (decision_attention_id, created_at DESC)`
    );
  }

  private applyGovernanceAttentionFilter(clauses: string[], params: string[], governanceAttention?: string) {
    const attention = coerceGovernanceAttentionFilter(governanceAttention);
    if (attention === "all") return;
    if (attention === "attention" || attention === "decision_attention") {
      clauses.push("(decision_attention_id IS NOT NULL OR type LIKE 'decision_attention_%')");
      return;
    }
    if (["generated", "reviewed", "resolved", "deferred"].includes(attention)) {
      clauses.push("(decision_attention_lifecycle = ? OR type = ?)");
      params.push(attention, `decision_attention_${attention}`);
    }
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
    if (filters.decisionAttentionId) {
      clauses.push("decision_attention_id = ?");
      params.push(filters.decisionAttentionId);
    }
    if (filters.decisionAttentionSeverity) {
      clauses.push("decision_attention_severity = ?");
      params.push(filters.decisionAttentionSeverity);
    }
    if (filters.decisionAttentionLifecycle) {
      clauses.push("decision_attention_lifecycle = ?");
      params.push(filters.decisionAttentionLifecycle);
    }
    this.applyGovernanceAttentionFilter(clauses, params, filters.governanceAttention);

    const whereSql = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const rows = db
      .prepare(
        `SELECT ${FEED_ITEM_SELECT_COLUMNS}
         FROM feed_items
         ${whereSql}
         ORDER BY created_at DESC, id DESC`
      )
      .all(...params) as FeedItemDbRow[];

    return rows.map(mapFeedItemRow);
  }

  getById(feedId: string): FeedItemRecord | null {
    this.ensureFeedMetadataColumns();
    const row = db
      .prepare(
        `SELECT ${FEED_ITEM_SELECT_COLUMNS}
         FROM feed_items
         WHERE id = ?`
      )
      .get(feedId) as FeedItemDbRow | undefined;
    return row ? mapFeedItemRow(row) : null;
  }

  create(input: CreateFeedInput): FeedItemRecord {
    this.ensureFeedMetadataColumns();
    const metadata = validateReplayMetadata({
      governanceCategory: input.governanceCategory ?? undefined,
      replayCategory: input.replayCategory ?? undefined,
      continuityCategory: input.continuityCategory ?? undefined,
      advisoryLevel: input.advisoryLevel ?? undefined,
      replaySeverity: input.replaySeverity ?? undefined,
      replaySource: input.replaySource ?? undefined,
      replayTags: input.replayTags ?? undefined,
    });
    const attention = validateDecisionAttentionMetadata({
      decisionAttentionId: input.decisionAttentionId ?? undefined,
      decisionAttentionSeverity: input.decisionAttentionSeverity ?? undefined,
      decisionAttentionCategory: input.decisionAttentionCategory ?? undefined,
      decisionAttentionReason: input.decisionAttentionReason ?? undefined,
      decisionAttentionSource: input.decisionAttentionSource ?? undefined,
      decisionAttentionReplayConfidence: input.decisionAttentionReplayConfidence ?? undefined,
      decisionAttentionContinuityCategory: input.decisionAttentionContinuityCategory ?? undefined,
      decisionAttentionLifecycle: input.decisionAttentionLifecycle ?? undefined,
    });
    db.prepare(
      `INSERT INTO feed_items (
         id, mission_id, mission_name, task_id, decision_id, type, status, author, author_name, message,
         governance_category, replay_category, continuity_category, advisory_level, replay_severity, replay_source,
         replay_tags_json, metadata_json,
         decision_attention_id, decision_attention_severity, decision_attention_category, decision_attention_reason,
         decision_attention_source, decision_attention_replay_confidence, decision_attention_continuity_category,
         decision_attention_lifecycle,
         created_at
       ) VALUES (
         @id, @missionId, @missionName, @taskId, @decisionId, @type, @status, @author, @authorName, @message,
         @governanceCategory, @replayCategory, @continuityCategory, @advisoryLevel, @replaySeverity, @replaySource,
         @replayTagsJson, @metadataJson,
         @decisionAttentionId, @decisionAttentionSeverity, @decisionAttentionCategory, @decisionAttentionReason,
         @decisionAttentionSource, @decisionAttentionReplayConfidence, @decisionAttentionContinuityCategory,
         @decisionAttentionLifecycle,
         @createdAt
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
      governanceCategory: metadata.governanceCategory,
      replayCategory: metadata.replayCategory,
      continuityCategory: metadata.continuityCategory,
      advisoryLevel: metadata.advisoryLevel,
      replaySeverity: metadata.replaySeverity,
      replaySource: metadata.replaySource,
      replayTagsJson: JSON.stringify(metadata.replayTags),
      metadataJson: input.metadata ? JSON.stringify(input.metadata) : null,
      decisionAttentionId: attention.decisionAttentionId ?? null,
      decisionAttentionSeverity: attention.decisionAttentionSeverity ?? null,
      decisionAttentionCategory: attention.decisionAttentionCategory ?? null,
      decisionAttentionReason: attention.decisionAttentionReason ?? null,
      decisionAttentionSource: attention.decisionAttentionSource ?? null,
      decisionAttentionReplayConfidence: attention.decisionAttentionReplayConfidence ?? null,
      decisionAttentionContinuityCategory: attention.decisionAttentionContinuityCategory ?? null,
      decisionAttentionLifecycle: attention.decisionAttentionLifecycle ?? null,
      createdAt: input.createdAt,
    });

    return this.getById(input.id) as FeedItemRecord;
  }
}

export const feedRepository = new FeedRepository();
