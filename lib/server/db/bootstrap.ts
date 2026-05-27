import "server-only";
import fs from "node:fs";
import path from "node:path";
import { decisions, missions, organizationFeedItems, runtimeCosts, tasks } from "@/data/mockData";
import { db } from "@/lib/server/db/client";

let initialized = false;

function nowLabel() {
  return "Just now";
}

function readSchemaSql() {
  const schemaPath = path.join(process.cwd(), "lib", "server", "db", "schema.sql");
  return fs.readFileSync(schemaPath, "utf-8");
}

function applySchema() {
  db.exec(readSchemaSql());
  const decisionColumns = db.prepare(`PRAGMA table_info(decisions)`).all() as Array<{ name: string }>;
  if (!decisionColumns.some((c) => c.name === "selected_option")) {
    db.exec(`ALTER TABLE decisions ADD COLUMN selected_option TEXT`);
  }
  const taskColumns = db.prepare(`PRAGMA table_info(tasks)`).all() as Array<{ name: string }>;
  if (!taskColumns.some((c) => c.name === "assigned_agent_id")) {
    db.exec(`ALTER TABLE tasks ADD COLUMN assigned_agent_id TEXT`);
  }
}

function seedMissions() {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO missions (
      id, name, description, summary, status, health, progress, created_at, updated_at
    ) VALUES (
      @id, @name, @description, @summary, @status, @health, @progress, @createdAt, @updatedAt
    )
  `);

  const tx = db.transaction(() => {
    for (const mission of missions) {
      insert.run({
        id: mission.id,
        name: mission.name,
        description: mission.description,
        summary: mission.summary,
        status: mission.status,
        health: mission.health,
        progress: mission.progress,
        createdAt: nowLabel(),
        updatedAt: mission.updatedAt ?? nowLabel(),
      });
    }
  });
  tx();
}

function seedDecisions() {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO decisions (
      id, mission_id, mission_name, title, summary, status, selected_option, priority, created_at, updated_at
    ) VALUES (
      @id, @missionId, @missionName, @title, @summary, @status, @selectedOption, @priority, @createdAt, @updatedAt
    )
  `);

  const tx = db.transaction(() => {
    for (const decision of decisions) {
      insert.run({
        id: decision.id,
        missionId: decision.relatedMissionId,
        missionName: decision.missionName,
        title: decision.title,
        summary: decision.summary,
        status: decision.status,
        selectedOption: null,
        priority: decision.priority,
        createdAt: nowLabel(),
        updatedAt: nowLabel(),
      });
    }
  });
  tx();
}

function seedTasks() {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO tasks (
      id, mission_id, mission_name, related_decision_id, title, status, priority, created_from,
      progress, eta, assigned_to, assigned_agent_id, dependencies_json, created_at, updated_at
    ) VALUES (
      @id, @missionId, @missionName, @relatedDecisionId, @title, @status, @priority, @createdFrom,
      @progress, @eta, @assignedTo, @assignedAgentId, @dependenciesJson, @createdAt, @updatedAt
    )
  `);

  const tx = db.transaction(() => {
    for (const task of tasks) {
      insert.run({
        id: task.id,
        missionId: task.missionId,
        missionName: task.missionName,
        relatedDecisionId: task.relatedDecisionId ?? null,
        title: task.title,
        status: task.status,
        priority: task.priority ?? null,
        createdFrom: task.createdFrom ?? null,
        progress: task.progress,
        eta: task.eta,
        assignedTo: task.assignedTo,
        assignedAgentId: task.assignedAgentId ?? null,
        dependenciesJson: JSON.stringify(task.dependencies ?? []),
        createdAt: task.createdAt ?? nowLabel(),
        updatedAt: task.updatedAt ?? nowLabel(),
      });
    }
  });
  tx();
}

function seedFeed() {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO feed_items (
      id, mission_id, mission_name, task_id, decision_id, type, status, author, author_name, message, created_at
    ) VALUES (
      @id, @missionId, @missionName, @taskId, @decisionId, @type, @status, @author, @authorName, @message, @createdAt
    )
  `);

  const tx = db.transaction(() => {
    for (const item of organizationFeedItems) {
      insert.run({
        id: item.id,
        missionId: item.missionId,
        missionName: item.missionName,
        taskId: item.taskId ?? null,
        decisionId: item.decisionId ?? null,
        type: item.type,
        status: item.status ?? null,
        author: item.author,
        authorName: item.authorName,
        message: item.message,
        createdAt: item.timestamp,
      });
    }
  });
  tx();
}

function seedRuntimeEvents() {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO runtime_events (
      id, mission_id, provider, severity, event_type, message, created_at
    ) VALUES (
      @id, @missionId, @provider, @severity, @eventType, @message, @createdAt
    )
  `);

  const tx = db.transaction(() => {
    for (const row of runtimeCosts) {
      insert.run({
        id: `runtime-${row.provider.toLowerCase().replace(/\s+/g, "-")}`,
        missionId: null,
        provider: row.provider,
        severity: row.health === "down" ? "danger" : row.health === "degraded" ? "warning" : "info",
        eventType: "provider_health_snapshot",
        message: `${row.provider} status is ${row.health}.`,
        createdAt: nowLabel(),
      });
    }
  });
  tx();
}

export function bootstrapDatabase() {
  if (initialized) return;
  applySchema();
  seedMissions();
  seedDecisions();
  seedTasks();
  seedFeed();
  seedRuntimeEvents();
  initialized = true;
}
