# Changelog

All notable changes to ProductAI are documented here.

## 2026-05-27

### Added (Phase 3-3 hybrid persistence)

- Persistence mode feature flag:
  - `NEXT_PUBLIC_PRODUCTAI_PERSISTENCE_MODE`
  - values: `local`, `hybrid`, `remote` (default: `hybrid`)
- Best-effort write sync helper:
  - local-first updates
  - async backend writes
  - non-blocking warn-only failure handling
- Sync-capable store bridge actions:
  - task status/task create/task event write sync
  - feed create write sync
  - judgment status write sync
- Service payload mappers for task/feed write calls.
- Settings visibility for persistence mode and sync policy.

### Changed (Phase 3-3)

- Judgment, Task status, suggested task actions, and decision->task creation flows now use sync bridge actions.
- Existing local store actions remain intact as fallback-safe behavior.
- UI/UX flow preserved while backend persistence is introduced incrementally.

### Added (Phase 3-2 write foundation)

- Task write endpoints:
  - `POST /api/tasks`
  - `GET /api/tasks/:taskId`
  - `PATCH /api/tasks/:taskId`
- Feed write endpoints:
  - `POST /api/feed`
  - `GET /api/feed/:feedId`
- Judgment write endpoints:
  - `GET /api/judgments`
  - `GET /api/judgments/:decisionId`
  - `PATCH /api/judgments/:decisionId`
- Repository write methods for tasks/feed/judgments.
- Shared API response helpers (`ok` / `fail`) and service API client wrapper.
- Service write methods:
  - task create/update
  - feed create
  - judgment status update
- Store migration preparation methods for remote write hooks (non-breaking).

### Changed (Phase 3-2)

- API responses normalized to envelope format:
  - success: `{ ok: true, data }`
  - error: `{ ok: false, error }`
- DB bootstrap extended with lightweight schema-forward migration checks.
- Task/decision persistence columns extended (`assigned_agent_id`, `selected_option`).

### Added (Phase 3-1 foundation)

- SQLite persistence base with `better-sqlite3` and local DB bootstrap.
- Initial backend schema for:
  - missions
  - decisions
  - tasks
  - feed_items
  - runtime_events
- Domain mapping layer (`lib/domain`) for mission/task/feed/judgment records.
- Repository abstraction layer (`lib/server/repositories`) to isolate SQL from UI.
- Backend API foundation with route handlers:
  - `GET /api/missions`
  - `GET /api/tasks`
  - `GET /api/feed`
- Service layer preparation (`lib/services`) for future store migration.
- Phase 3 architecture documentation (`docs/PHASE3_BACKEND_FOUNDATION.md`).

### Changed (Phase 3-1 stabilization)

- Feed type model normalized with explicit `judgment` and `memory` types.
- Feed filtering moved closer to type/status-based matching.
- Blocker age surfaced in mission and cross-mission blocker visibility.
- Empty-state wording and filter chip consistency refined without UI redesign.

### Added

- Mission-centered ProductAI UI foundation across CEO Home, Missions, Judgment, Tasks, Feed, Runtime, and Settings.
- Persistent local state architecture using Zustand + localStorage for mission, task, organization, runtime, and UI slices.
- Judgment-driven task workflow:
  - create task / follow-up task from decisions
  - bidirectional decision-task linking
  - execution timeline updates.
- Task execution console capabilities:
  - in-detail status actions
  - suggested operational actions
  - mission/feed/runtime cross-linking.
- Mission Execution Map and lightweight dependency visibility:
  - execution flow steps
  - blocked waiting chains
  - dependency insights.
- Execution drilldown navigation:
  - query-based tasks filters (`mission`, `status`)
  - contextual feed filters (`mission`, `task`, `type`, `status`)
  - deep links from mission/task activity cards.
- Cross-mission blocker visibility and execution risk overview for CEO operations.

### Changed

- Organization feed filtering normalized toward type/status-based matching.
- Runtime and operational wording aligned to calm SaaS tone.
- Navigation consistency improved with lightweight breadcrumbs and consistent deep-link labels.
- Empty-state messaging refined for operational clarity.

### Notes

- ProductAI remains frontend-only MVP scope in Phase 2.
- Backend, SQLite, real orchestration, and external integrations are intentionally deferred.
