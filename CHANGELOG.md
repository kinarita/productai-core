# Changelog

All notable changes to ProductAI are documented here.

## 2026-05-28

### Added (Phase 5-2 controlled processing governance stub)

- Controlled processing governance layer in `lib/orchestration/processing/`.
- Processing session model, policy gates, boundary semantics, and audit continuity.
- `processingStore` with prepare/activate/pause/revoke governance actions.
- Queue UI controls for processing governance lifecycle.
- Runtime & Cost processing governance state summary.
- Documentation: `docs/PHASE5_PROCESSING_GOVERNANCE.md`.

### Added (Phase 5-1 controlled execution session governance layer)

- Controlled execution start layer in `lib/orchestration/execution-start/`.
- ExecutionSession model, operator signature, and runtime reservation mock.
- Execution start policy and audit continuity.
- Queue UI flow for request/confirm/start/deny/revoke session governance states.
- Runtime and Task detail visibility for execution session governance.
- Documentation: `docs/PHASE5_EXECUTION_START.md`.

### Added (Phase 4-7 controlled execute-ready governance layer)

- Controlled execute stub architecture in `lib/orchestration/execute/`.
- Final governance validation policy for `execution_authorized` → `execute_ready`.
- Revoke/deny-before-start flow for execute readiness.
- Execute intent confirmation and execute audit continuity in task queue UI.
- Runtime execute governance readiness summary.
- Documentation: `docs/PHASE4_EXECUTE_READY.md`.

### Added (Phase 4-6 human execution authorization foundation)

- Human execution authorization layer in `lib/orchestration/authorization/`.
- Authorization request/signature/audit models and store.
- Authorization policy gates and deny/revoke flows.
- Execution intent review in Task Detail and queue cards.
- Runtime authorization governance summary.
- Documentation: `docs/PHASE4_EXECUTION_AUTHORIZATION.md`.

### Added (Phase 4-5 controlled execution queue foundation)

- Controlled execution queue in `lib/orchestration/queue/` with gating, reservations, and worker preparation.
- `executionQueueStore` and readiness scoring (0–100).
- Runtime lock advisory pausing queue progression without automated recovery.
- Task Detail queue status and Runtime execution queue governance views.
- Queue UI components and feed governance events.
- Documentation: `docs/PHASE4_EXECUTION_QUEUE.md`.

### Added (Phase 4-4 controlled task materialization)

- Task materialization layer in `lib/orchestration/materialization/`.
- Task provenance and execution readiness fields on operational tasks.
- Materialize Tasks flow from approved execution tickets in Executive Sync.
- Governance provenance on Task Detail; execution readiness on Mission Detail and Runtime.
- Materialization UI components and execution queue visualization.
- Documentation: `docs/PHASE4_TASK_MATERIALIZATION.md`.

### Added (Phase 4-3 controlled execution handoff foundation)

- Controlled execution handoff layer in `lib/orchestration/execution/`.
- ExecutionTicket model with approval signatures and local audit trail.
- Mock execution adapters for MCP, GitHub, ClaudeCode, InternalAgent, RuntimeOperation (boundary only).
- Executive Sync handoff flow: create ticket, approve/reject handoff.
- Runtime & Cost execution governance visibility section.
- Orchestration UI: `ExecutionTicketCard`, `ApprovalSignatureView`, `HandoffStatusBadge`.
- Documentation: `docs/PHASE4_EXECUTION_HANDOFF.md`.

### Changed (Phase 4-3)

- Execution policy now includes `prepare_execution_handoff` and explicit human-only handoff authorization messaging.

### Added (Phase 4-2 orchestration governance & approval flow)

- Orchestration policy layer in `lib/orchestration/policy/` (approval, execution, lifecycle types).
- Proposal lifecycle model and in-memory `proposalStore`.
- Executive Sync structured proposals with human approval actions and advisory execution plans.
- Judgment AI recommendation governance overlay (note, execution impact, policy boundary).
- Runtime Observer recommendation-only governance messaging.
- Organization Feed governance event generation.
- Orchestration UI components: `ProposalCard`, `ApprovalBadge`, `RiskIndicator`, `GovernanceNote`.
- Documentation: `docs/PHASE4_ORCHESTRATION_POLICY.md`.

### Changed (Phase 4-2)

- Orchestrator now supports `generateExecutiveProposals`, `generateExecutionPlan`, and `generateGovernanceFeedEvent`.
- Operational tone remains calm and executive; no autonomous execution UI introduced.

## 2026-05-27

### Added (Phase 4-1 orchestration seed foundation)

- Orchestration architecture base in `lib/orchestration`:
  - role model contracts
  - context builder
  - orchestrator interface + deterministic mock implementation
  - prompt template seed files
- AI provider abstraction in `lib/ai`:
  - provider interface
  - mock provider
  - provider resolver
- New orchestration role coverage:
  - `CEO`
  - `Runtime Observer`
- Executive Sync actions:
  - Generate AI Discussion
  - Generate Operational Summary
- Judgment AI recommendation section with structured support output.
- Organization Feed AI event generation action.
- Runtime Observer operational insight section in Runtime & Cost.
- Documentation for Phase 4 foundation:
  - `docs/PHASE4_ORCHESTRATION_FOUNDATION.md`

### Changed (Phase 4-1)

- ProductAI now exposes role-based orchestration thinking without autonomous execution.
- Operational wording remains calm and executive; no chatbot-style paneling added.

### Added (Phase 3-6 sync policy hardening)

- Formal sync policy document: `docs/PHASE3_SYNC_POLICY.md`.
- Sync warning deduplication with fingerprint, `count`, and `lastSeenAt`.
- Display-only retry guidance derived from `pendingHydrationCount`.
- Sync metadata helpers (`syncMetadata.ts`) and operational UI labels (`syncPolicyUi.ts`).
- Settings sync operations card with remote mode explanation and warning summaries.
- sync store persist migration for warning metadata compatibility.

### Changed (Phase 3-6)

- Hydration mappers apply `syncedAt` via centralized metadata helpers.
- Runtime/Settings backend health wording normalized to calm operational tone.
- Manual hydration controls disabled in `local` persistence mode.

### Added (Phase 3-5 sync operational layer)

- Manual sync operations in Settings:
  - Refresh from backend
  - Run hydration
  - Retry sync
- Lightweight backend health check service with timeout probe.
- Extended sync store operational fields:
  - last successful read/write timestamps
  - pending hydration retry count
  - backend health status
  - structured sync warnings
- Runtime sync warnings section with calm operational messaging.
- Sync summary expansion in Settings for operational visibility.
- Metadata normalization support in frontend types:
  - `createdAt`, `updatedAt`, `syncedAt?` across core entities.

### Changed (Phase 3-5)

- `writeSync` now records success timestamps and operational warnings on failures.
- `readHydrationService` now updates operational sync telemetry and warning lifecycle.
- Sync behavior messaging aligned to operational continuity tone.

### Added (Phase 3-4 read hydration bridge)

- Mode-aware read hydration service for missions/tasks/feed/judgments.
- Global client hydration trigger mounted from layout (quiet, no blocking UI).
- Sync diagnostics store (`productai-sync`) with hydration status and small read/write warning logs.
- Runtime & Cost sync health panel:
  - persistence mode
  - hydration status
  - last hydration timestamp
  - recent sync warnings
- Settings sync details:
  - persistence mode / backend sync mode
  - hydration status / last hydration
  - clear sync log action

### Changed (Phase 3-4)

- Store slices now support backend-to-local merge actions for hybrid coexistence.
- Remote write failures are recorded in sync store while keeping warn-only non-blocking behavior.
- Reset flow clears sync persisted state (`productai-sync`) together with existing local stores.

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
