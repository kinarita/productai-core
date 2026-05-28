PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS missions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  summary TEXT NOT NULL,
  status TEXT NOT NULL,
  health TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS decisions (
  id TEXT PRIMARY KEY,
  mission_id TEXT NOT NULL,
  mission_name TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  status TEXT NOT NULL,
  selected_option TEXT,
  priority TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (mission_id) REFERENCES missions (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  mission_id TEXT NOT NULL,
  mission_name TEXT NOT NULL,
  related_decision_id TEXT,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  assigned_agent_id TEXT,
  priority TEXT,
  created_from TEXT,
  progress INTEGER NOT NULL DEFAULT 0,
  eta TEXT NOT NULL,
  assigned_to TEXT NOT NULL,
  dependencies_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (mission_id) REFERENCES missions (id) ON DELETE CASCADE,
  FOREIGN KEY (related_decision_id) REFERENCES decisions (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS feed_items (
  id TEXT PRIMARY KEY,
  mission_id TEXT NOT NULL,
  mission_name TEXT NOT NULL,
  task_id TEXT,
  decision_id TEXT,
  type TEXT NOT NULL,
  status TEXT,
  author TEXT NOT NULL,
  author_name TEXT NOT NULL,
  message TEXT NOT NULL,
  governance_category TEXT,
  replay_category TEXT,
  continuity_category TEXT,
  advisory_level TEXT,
  replay_severity TEXT,
  replay_source TEXT,
  replay_tags_json TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (mission_id) REFERENCES missions (id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE SET NULL,
  FOREIGN KEY (decision_id) REFERENCES decisions (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS runtime_events (
  id TEXT PRIMARY KEY,
  mission_id TEXT,
  provider TEXT,
  severity TEXT NOT NULL,
  event_type TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_mission_status ON tasks (mission_id, status);
CREATE INDEX IF NOT EXISTS idx_feed_mission_created ON feed_items (mission_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_task_created ON feed_items (task_id, created_at DESC);
