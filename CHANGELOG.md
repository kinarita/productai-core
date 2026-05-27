# Changelog

All notable changes to ProductAI are documented here.

## 2026-05-27

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
