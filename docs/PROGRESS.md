# ProductAI Development Progress

## 2026-05-28 — Phase 5-5 governance analytics explainability and navigation

### Objective

Introduce explainable executive navigation for governance analytics with URL-synced filters, scoring transparency, and drilldown traceability.

### Implemented in Phase 5-5

- URL-synced governance filters in Runtime & Cost (`category`, `severity`, `advisory`, `mission`, `review`, `continuity`)
- Shareable executive analytics view links
- Governance continuity explanation model and score breakdown visibility
- Runtime analytics explainability section
- Processing review queue traceability links and severity history context
- Mission label normalization helper for analytics and feed surfaces
- Governance analytics drilldown links across CEO / Runtime / Mission / Task views
- Organization Feed governance filter chips for analytics and continuity events
- Documentation: `docs/PHASE5_GOVERNANCE_EXPLAINABILITY.md`

### Scope boundaries (kept)

- No actual execution, MCP/GitHub/Claude Code execution, deployment automation, or autonomous runtime orchestration

## 2026-05-28 — Phase 5-4 processing governance visibility analytics

### Objective

Raise processing governance to CEO/executive visibility with derived analytics, review distribution, mission risk context, and continuity scoring.

### Implemented in Phase 5-4

- Processing analytics layer in `lib/orchestration/processing/processingAnalytics.ts`
- Governance visibility model: `ProcessingGovernanceSummary`
- Runtime & Cost processing analytics section with calm filter controls
- Processing review queue and severity/category distribution visibility
- Governance continuity score (0-100) for executive reference
- CEO Home governance risk summary with mission drilldown
- Mission Detail processing governance summary
- Task Detail processing reason filters for reviewability
- Governance feed visibility event for processing analytics summary
- Documentation: `docs/PHASE5_PROCESSING_VISIBILITY.md`

### Scope boundaries (kept)

- No actual execution, MCP/GitHub/Claude Code execution, deployment automation, or autonomous runtime processing

## 2026-05-28 — Phase 5-3 processing review governance taxonomy

### Objective

Add structured processing governance reasons and first-class `processing_review_required` continuity around `processing_active`.

### Implemented in Phase 5-3

- Processing reason taxonomy under `lib/orchestration/processing/reasonTaxonomy.ts`
- Structured governance reason model on `ProcessingSession`
- Review lifecycle actions in `processingStore`: request review, resume, deny, revoke
- Review policy gates in `processingReviewPolicy.ts`
- Processing reason UI components and severity/category badges
- Processing audit extensions for review requested/resolved/denied/revoked + reason-added
- Processing review governance feed events
- Runtime & Cost processing review summary section
- Documentation: `docs/PHASE5_PROCESSING_REVIEW_POLICY.md`

### Scope boundaries (kept)

- No actual execution, MCP/GitHub/Claude Code execution, deployment automation, or autonomous processing

## 2026-05-28 — Phase 5-2 controlled processing governance stub

### Objective

Connect `execution_session_active` to `processing_active` semantics with governance continuity only, while keeping operational execution disabled.

### Implemented in Phase 5-2

- Processing layer under `lib/orchestration/processing/`
- `processingStore` with prepare/activate/pause/revoke flow
- Queue lifecycle extension for `processing_prepared` and `processing_active` (+ paused/revoked/review states)
- Processing boundary semantics and governance-only language
- Processing audit continuity and timeline components
- Task Detail processing controls and governance timeline visibility
- Runtime & Cost processing governance summary section
- Feed events for processing governance transitions
- Documentation: `docs/PHASE5_PROCESSING_GOVERNANCE.md`

### Scope boundaries (kept)

- No actual code execution, MCP/GitHub/Claude Code execution, deploy automation, or autonomous worker processing

## 2026-05-28 — Phase 5-1 controlled execution session governance layer

### Objective

Connect `execute_ready` to `execution_session_active` with final boundary confirmation, operator signature, and session audit continuity.

### Implemented in Phase 5-1

- Execution start layer under `lib/orchestration/execution-start/`
- `executionSessionStore` with request/confirm/start/deny/revoke flow
- Queue lifecycle extension for execution start states
- Execution boundary confirmation and operator signature components
- Task Detail execution session controls and audit visibility
- Runtime & Cost execution session governance summary
- Feed events for execution session governance transitions
- Documentation: `docs/PHASE5_EXECUTION_START.md`

### Scope boundaries (kept)

- No actual execution, adapters, background workers, or autonomous processing

## 2026-05-28 — Phase 4-7 controlled execute-ready governance layer

### Objective

Add final governance validation from `execution_authorized` to `execute_ready`, with revoke/deny-before-start and intent confirmation.

### Implemented in Phase 4-7

- Execute layer under `lib/orchestration/execute/`
- `executeStore` with execute review, ready validation, deny, revoke
- Queue lifecycle extension: `execute_review_pending`, `execute_ready`, `execute_denied`, `execute_revoked`
- Final governance policy checks for execute-ready transition
- Task Detail execution intent confirmation and execute audit continuity
- Runtime & Cost execute governance readiness summary
- Queue UI additions for execute review and revoke-before-start
- Documentation: `docs/PHASE4_EXECUTE_READY.md`

### Scope boundaries (kept)

- No actual execution, workers, MCP/GitHub/Claude Code execution, or autonomous loops

## 2026-05-28 — Phase 4-6 human execution authorization foundation

### Objective

Add final human authorization boundary for controlled execution queue items, including intent review, signatures, and revoke/deny governance.

### Implemented in Phase 4-6

- Authorization layer under `lib/orchestration/authorization/`
- `executionAuthorizationStore` for requests, signatures, and authorization audit
- Authorization policy gates for request/authorize/revoke conditions
- Queue lifecycle extension: `authorization_requested`, `execution_authorized`, `denied`, `revoked`
- Task Detail: execution intent review + authorization controls + audit continuity
- Runtime & Cost: authorization governance summary visibility
- Feed events for request / grant / deny / revoke
- Documentation: `docs/PHASE4_EXECUTION_AUTHORIZATION.md`

### Scope boundaries (kept)

- No actual execution, MCP/GitHub/Claude Code execution, background processing, or autonomous loops

## 2026-05-28 — Phase 4-5 controlled execution queue foundation

### Objective

Connect execution-ready tasks to a controlled execution queue with gating, reservations, worker preparation, and runtime lock — without actual execution.

### Implemented in Phase 4-5

- Execution queue layer under `lib/orchestration/queue/`
- `executionQueueStore` with enqueue, reserve, release, prepare, complete review
- Auto-enqueue on task materialization
- Runtime lock (advisory, no auto recovery)
- Readiness scoring 0–100
- UI: `ExecutionQueueCard`, `ReadinessScoreBadge`, `RuntimeLockBadge`, `QueueLifecycleView`
- Task Detail execution queue status section
- Runtime & Cost execution queue governance section
- Organization Feed queue governance events
- Documentation: `docs/PHASE4_EXECUTION_QUEUE.md`

### Scope boundaries (kept)

- No actual execution, workers, MCP, GitHub, Claude Code, or autonomous queue processing

## 2026-05-28 — Phase 4-4 controlled task materialization

### Objective

Materialize approved execution plans into execution-ready operational tasks with provenance and governance continuity — without autonomous execution.

### Implemented in Phase 4-4

- Materialization layer under `lib/orchestration/materialization/`
- `materializationStore` integrated with `taskStore` and `executionStore`
- Task provenance fields on shared `Task` type
- Executive Sync: Materialize Tasks, Request Materialization Review
- UI: `MaterializationStatusBadge`, `ProvenanceCard`, `ExecutionReadinessCard`
- Task Detail governance provenance section
- Mission Detail and Runtime execution readiness visibility
- Organization Feed materialization events
- Execution queue visualization (pending / governance_ready / execution_ready)
- Documentation: `docs/PHASE4_TASK_MATERIALIZATION.md`

### Scope boundaries (kept)

- No autonomous execution, workers, MCP, GitHub, Claude Code, or deployment automation

## 2026-05-28 — Phase 4-3 controlled execution handoff foundation

### Objective

Introduce execution handoff, execution tickets, approval signatures, and audit trail so humans can explicitly authorize execution boundaries — without running real execution.

### Implemented in Phase 4-3

- Execution handoff layer under `lib/orchestration/execution/`:
  - types, policy, handoff helpers, audit, adapter boundaries (mock)
- `executionStore` for tickets and audit log (in-memory)
- Executive Sync: Create Execution Ticket, Approve/Reject Handoff, linked execution plans
- UI: `ExecutionTicketCard`, `ApprovalSignatureView`, `HandoffStatusBadge`
- Runtime & Cost: Execution Governance visibility (pending/approved/queue)
- Policy extensions: `prepare_execution_handoff`, `requiresExecutionHandoffApproval`
- Feed: handoff_prepared / handoff_approved / handoff_rejected governance events
- Documentation: `docs/PHASE4_EXECUTION_HANDOFF.md`

### Scope boundaries (kept)

- No autonomous execution, workers, MCP/GitHub/Claude Code runs, deploy, or auto PR/merge

## 2026-05-28 — Phase 4-2 orchestration governance & approval flow

### Objective

Add orchestration policy, human approval boundaries, execution governance, and proposal lifecycle — without autonomous execution.

### Implemented in Phase 4-2

- Policy layer under `lib/orchestration/policy/`:
  - `policyTypes`, `orchestrationPolicy`, `approvalPolicy`, `executionPolicy`
- Proposal lifecycle: `proposal` → `approval_required` → `approved` → `execution_planned` (plus revision/rejected)
- In-memory `proposalStore` for proposals and execution plans
- Orchestrator extensions:
  - `generateExecutiveProposals`
  - `generateExecutionPlan`
  - `generateGovernanceFeedEvent`
  - Judgment recommendations enriched with governance metadata
- Executive Sync structured proposals with Approve / Request Revision / Reject
- Judgment governance notes on AI recommendations
- Runtime Observer recommendation-only governance messaging
- Organization Feed governance event generation
- UI components: `ProposalCard`, `ApprovalBadge`, `RiskIndicator`, `GovernanceNote`
- Documentation: `docs/PHASE4_ORCHESTRATION_POLICY.md`

### Scope boundaries (kept)

- No autonomous or automatic task execution
- No background workers, MCP, GitHub automation, or deployment automation
- No self-improving loops or realtime orchestration

## 2026-05-27 — Phase 4-1 orchestration seed foundation

### Objective

Introduce the first AI orchestration seed so ProductAI can generate role-based operational thinking without autonomous execution.

### Implemented in Phase 4-1

- Added orchestration architecture under `lib/orchestration`:
  - orchestrator interface + deterministic mock implementation
  - agent registry (CEO/COO/Architect/Engineer/QA/Runtime Observer)
  - context builder from Mission/Task/Decision/Feed/Runtime/Sync stores
  - prompt template foundation
- Added AI provider abstraction under `lib/ai`:
  - `generateText`, `summarize`, `analyze` interfaces
  - mock provider implementation and resolver
- Extended operational role model by including `CEO` and `Runtime Observer` in shared agent role types.
- Executive Sync now supports:
  - Generate AI Discussion
  - Generate Operational Summary
- Judgment Center now supports AI recommendation generation per decision.
- Organization Feed now supports lightweight AI-generated operational event insertion.
- Runtime & Cost now supports Runtime Observer insight generation.
- Added orchestration design document:
  - `docs/PHASE4_ORCHESTRATION_FOUNDATION.md`

### Scope boundaries (kept)

- No autonomous task execution.
- No background workers or realtime loops.
- No Claude Code/MCP/GitHub execution integration.
- No multi-user/auth/full remote orchestration flow.

## 2026-05-27 — Phase 3-6 sync policy hardening

### Objective

Formalize persistence sync policy and stabilize operational telemetry before remote mode, multi-user, and orchestration work.

### Implemented in Phase 3-6

- Added `docs/PHASE3_SYNC_POLICY.md` covering local/hybrid/remote modes, read/write priority, fallback, syncedAt policy, and future conflict resolution.
- Added sync warning deduplication in `syncStore` (fingerprint + count + lastSeenAt).
- Added display-only retry guidance from `pendingHydrationCount` (no automatic scheduler).
- Added `lib/services/syncMetadata.ts` (`markSyncedAt`, `withSyncedAt`, `getMostRecentSyncTime`).
- Added `lib/services/syncPolicyUi.ts` for operational labels (backend health, retry guidance, remote mode explanation).
- Hydration mappers now stamp `syncedAt` via sync metadata helpers.
- Settings / Runtime sync UI polish: warning counts, last seen, retry guidance, calm tone.
- sync store persist migration v2 for backward-compatible warning shape.

### Coexistence status

- local-first UX unchanged.
- No full remote source-of-truth migration.
- No conflict resolution UI in this phase.

## 2026-05-27 — Phase 3-5 sync operational layer

### Objective

Evolve persistence sync from internal background behavior into an operationally visible, CEO-readable sync system.

### Implemented in Phase 3-5

- Added manual sync operations in Settings:
  - Refresh from backend
  - Run hydration
  - Retry sync
- Expanded sync state model:
  - `lastSuccessfulWriteAt`
  - `lastSuccessfulReadAt`
  - `pendingHydrationCount`
  - `backendHealth`
  - `syncWarnings`
- Connected write sync to operational tracking:
  - record write failure
  - add calm warning message
  - record successful write time
- Connected read hydration to operational tracking:
  - backend health check before hydration
  - warning creation on hydration/read issues
  - pending retry count updates
  - successful read timestamp updates
- Added lightweight backend health service with timeout-based probe.
- Added runtime sync warnings + operational sync health details.
- Normalized persistence metadata shape in frontend types:
  - `createdAt`, `updatedAt`, `syncedAt?`

### Coexistence status

- local-first UX remains unchanged.
- backend unavailability does not block local execution.
- sync UI remains quiet and operational (no panic-style overlays).

## 2026-05-27 — Phase 3-4 read hydration bridge

### Objective

Extend hybrid persistence from write-only sync to mode-aware read hydration while preserving local-first UX.

### Implemented in Phase 3-4

- Added read hydration service (`lib/services/readHydrationService.ts`) with mode-aware behavior:
  - `local`: skip backend hydration
  - `hybrid`: show local state first, then hydrate quietly from backend
  - `remote`: backend-read-ready foundation
- Added global one-time client hydration effect:
  - `components/ProductAIReadHydration.tsx`
  - mounted in `app/layout.tsx`
- Added merge actions for remote data coexistence:
  - `missionStore.mergeMissionsFromRemote`
  - `taskStore.mergeTasksFromRemote`
  - `organizationStore.mergeFeedFromRemote`
  - `organizationStore.mergeDecisionsFromRemote`
- Added sync status store (`lib/store/syncStore.ts`) with persisted lightweight diagnostics:
  - hydration status / last hydrated timestamp
  - small read and write failure logs
- Connected write sync failure handling to sync store (`recordWriteFailure`).
- Added sync health visibility in Runtime & Cost and Settings views.

### Coexistence status

- localStorage remains first-class for immediate UX.
- Backend reads supplement local state in hybrid mode.
- Local-only items are preserved during merge.
- Hydration failures are logged softly and do not break UI.

## 2026-05-27 — Phase 3-3 hybrid persistence sync layer

### Objective

Build a safe bridge from local-first store actions to backend write APIs without changing the current UX.

### Implemented in Phase 3-3

- Added persistence feature flag (`local` / `hybrid` / `remote`) with environment override:
  - `NEXT_PUBLIC_PRODUCTAI_PERSISTENCE_MODE`
- Added generic write sync helper (`syncWrite`) for:
  - local immediate update
  - best-effort remote write in hybrid/remote mode
  - non-blocking error handling (`console.warn`)
- Added synchronized store actions:
  - `taskStore.updateTaskStatusWithSync`
  - `taskStore.addTaskWithSync`
  - `taskStore.addTaskEventWithSync`
  - `organizationStore.addFeedItemWithSync`
  - `organizationStore.updateDecisionStatusWithSync`
- Migrated key UI write paths to sync actions:
  - Judgment decision actions
  - Task status actions
  - Judgment -> Task creation
  - Suggested task actions
- Added service payload mappers to keep UI/store code clean.
- Added small settings visibility:
  - persistence mode
  - backend sync policy (best effort)

### Coexistence status

- Local state remains source of immediate UX behavior.
- Remote persistence writes happen in the background when mode is `hybrid`.
- Backend write failures do not break UI flow.

## 2026-05-27 — Phase 3-2 write API foundation

### Objective

Establish backend write capability (tasks, judgments, feed) while keeping current UI interaction model stable.

### Implemented in Phase 3-2

- Added Task write API foundation:
  - `POST /api/tasks`
  - `GET /api/tasks/:taskId`
  - `PATCH /api/tasks/:taskId`
- Added Feed write API foundation:
  - `POST /api/feed`
  - `GET /api/feed/:feedId`
- Added Judgment write API foundation:
  - `GET /api/judgments`
  - `GET /api/judgments/:decisionId`
  - `PATCH /api/judgments/:decisionId`
- Added repository write methods:
  - `taskRepository.create/update/getById`
  - `feedRepository.create/getById`
  - `judgmentRepository.getById/updateStatus`
- Added service write methods and shared API client:
  - `createTask`, `updateTask`
  - `createFeedItem`
  - `updateDecisionStatus`
  - `apiClient` response/error wrapper
- Added lightweight store migration prep methods:
  - `taskStore.createTaskRemote/updateTaskRemote`
  - `organizationStore.addFeedRemote/updateDecisionStatusRemote`

### API response contract (Phase 3-2)

- success: `{ "ok": true, "data": ... }`
- failure: `{ "ok": false, "error": "..." }`
- status coverage:
  - `200/201`
  - `400` validation
  - `404` not found
  - `500` server failure

### Coexistence

- Zustand + localStorage flow remains primary.
- SQLite write path is now available via API/services.
- UI behavior and navigation remain unchanged in this phase.

## 2026-05-27 — Phase 3-1 backend foundation

### Objective

Move ProductAI from store-only architecture to a hybrid persistence foundation without breaking existing UI/UX.

### Implemented in Phase 3-1

- Added SQLite foundation with `better-sqlite3`.
- Added DB bootstrap flow:
  - schema initialization
  - minimal seed insertion from existing mock data
  - local DB file generation (`data/productai.db`)
- Added domain separation (`lib/domain/*`) for mission/task/feed/judgment row mapping.
- Added repository layer (`lib/server/repositories/*`) with SQL access abstraction.
- Added API route foundation:
  - `GET /api/missions`
  - `GET /api/tasks`
  - `GET /api/feed`
- Added service layer prep (`lib/services/*`) for future store->API migration.
- Kept Zustand/localStorage operational behavior intact (coexistence mode).
- Added feed type/status normalization improvements toward type-first filtering.

### Architecture evolution

- **Before**: UI -> Zustand stores -> localStorage
- **Now**: UI -> Zustand stores (active) + API/Repository/SQLite foundation (ready)
- **Future**: UI -> services -> API -> repositories -> SQLite (gradual migration)

### Notes

- This phase intentionally avoids auth/multi-user/realtime/background execution.
- UI visual system and navigation remain unchanged by design.

## 2026-05-27 — Phase 2 complete (2-1 to 2-11)

### Phase 2 timeline

- **2-1 Static UI MVP**: core pages and calm SaaS layout foundation.
- **2-2 Typed mock domain**: mission / decision / task / runtime domain modeling.
- **2-3 State orchestration**: Zustand-based mission, organization, runtime stores.
- **2-4 Runtime-aware operations**: runtime cost/health surfaced into operational views.
- **2-5 Mission detail hardening**: stability fixes, persist migration, mission context integrity.
- **2-6 Persistent task execution**: task status transitions with mission/feed side effects.
- **2-7 Task detail timeline**: structured task event model and Task Detail page.
- **2-8 Execution console**: Task Detail actions, suggested actions, CEO/Mission task visibility.
- **2-9 Judgment-driven execution**: Judgment -> Task creation and bidirectional decision-task links.
- **2-10 Mission execution map**: dependency visibility, blocked-path surfacing, execution risk cards.
- **2-11 Drilldown navigation**: cross-page execution filters, blocker drilldown, deep links.

### Implemented capabilities (Phase 2)

- Mission-centered operational UI (CEO Home, Missions, Judgment, Tasks, Feed, Runtime, Settings).
- Local-first persistent state using Zustand + localStorage with reset support.
- Human-in-the-loop judgment flow connected to execution:
  - Decision status updates
  - Task creation from judgment
  - Task event timeline and action execution
- Organization Feed linked with mission/task/decision context and drilldown navigation.
- Dependency-aware mission execution visibility:
  - Waiting chains
  - Blocked dependencies
  - Cross-mission blocker overview
- Runtime awareness integrated into execution and mission context.

### Current architecture snapshot

- **UI**: Next.js app router + React components.
- **State**: Zustand stores (`ui`, `missions`, `organization`, `runtime`, `tasks`) with persist.
- **Data**: typed mock data in `data/mockData.ts`.
- **Navigation**: mission/task/feed query-based drilldown URLs.
- **Reset integrity**: `resetAllProductAIState()` clears all persisted keys and reloads.

### Current constraints (intentional)

- Frontend local state only (single-user MVP behavior).
- No backend persistence or server-side orchestration.
- No real external execution control.
- Feed and blocker age partly mock-derived from operational labels (`Just now`, `xh ago`).

### Deferred to Phase 3+

- SQLite and backend API layer.
- Auth and multi-user collaboration model.
- GitHub API integration with real repo operations.
- MCP / Claude Code / runtime orchestration integration.
- WebSocket live sync.

### ProductAI philosophy status

- Mission-first structure is established.
- Judgment remains the CEO authority gate.
- Execution state is operationally visible and traceable.
- UI tone remains calm, structured, and operational (non-chatbot, non-cyberpunk).

## 2026-05-28 (Phase 5-6 governance memory and replay)

- Added governance history architecture under `lib/orchestration/governance-history/`.
- Added derived governance timeline event model across processing/review/runtime/feed continuity.
- Added executive governance snapshot builder for point-in-time executive context.
- Added operational replay bundle (timeline + snapshot + continuity explanation + memory items).
- Added mission governance history panel and runtime replay timeline filters.
- Added governance memory section in Memory Vault with recurring risk patterns.
- Added historical continuity explanation narrative in analytics explainability UI.
- Added organization feed support for timeline and governance memory related events.
- Maintained human-in-the-loop boundary:
  - AI summarizes and recommends.
  - Human operators decide priorities and approvals.

## 2026-05-28 (Phase 5-7 shareable executive governance replay)

- Added full replay URL synchronization in Runtime & Cost for executive shareability.
- Added Organization Feed governance chip/query bidirectional sync (`gov`).
- Added portable executive query schema coverage in CEO Home and Mission Detail.
- Added replay snapshot persistence (`replaySnapshotStore`) with local-first continuity history.
- Added Historical Governance Trend visibility in Runtime replay.
- Added executive replay summary model and summary generation.
- Added replay summary/export panel actions:
  - Copy Replay Summary
  - Share Replay View
- Added continuity-enhanced governance memory phrasing based on recent replay events.
- Extended explainability continuity with replay and continuity-shift narratives.

## 2026-05-28 (Phase 5-8 unified replay query architecture)

- Added shared replay query architecture under `lib/replay-query/`.
- Unified replay query state via `ReplayQueryState` as a single filtering schema.
- Added shared parse/build/merge helpers for Runtime/Feed/CEO/Mission continuity.
- Added replay scope/window components and query context summary components.
- Consolidated replay query-driven navigation continuity for executive drilldown.
- Expanded feed query handling to align with replay schema and `gov` continuity.
- Updated replay summary model with scope/window/continuity context fields.

## 2026-05-28 (Phase 5-9 governance replay polish)

- Added metadata-driven feed filtering for governance/replay precision.
- Added queue feed metadata normalization helper for replay categories and severity.
- Migrated Runtime replay filters to chip-based interaction for UX consistency.
- Applied replayWindow semantics to visible timeline counts (latest/short/medium/extended).
- Extended replay summary with visible event count and timeline density context.
- Improved timeline readability with compact/expanded behavior by replay window.
- Refined explainability wording to reflect replay scope and replay window context.

## 2026-05-28 (Phase 5-10 governance replay stabilization)

- Completed metadata normalization for governance/replay feed pathways.
- Added replay metadata helper (`buildReplayMetadata`, `normalizeReplayMetadata`, `resolveReplaySeverity`).
- Hardened continuity category values and replay category taxonomy.
- Reduced message-parsing dependency in timeline/feed filtering by adopting metadata fields.
- Unified replay wording for scope/window/continuity readability.
- Added Phase 5 completion documentation for governance replay foundation boundaries.

## 2026-05-28 (Phase 6-1 backend metadata alignment)

- Aligned `feed_items` schema with governance replay metadata columns.
- Added safe bootstrap migrations for existing DB compatibility.
- Extended feed repository and API routes for metadata round-trip and metadata-based filters.
- Hardened domain feed row parsing with defensive JSON handling for tags/metadata fields.
- Added replay continuity query compatibility normalization (`stable/degraded` legacy mapping).
- Applied replay window wording consistency helper to CEO and Mission views.

## 2026-05-28 (Phase 6-2 metadata API verification and fallback hardening)

- Added replay metadata taxonomy validation and safe fallback helper.
- Hardened feed API and repository to normalize invalid metadata without failing requests.
- Hardened feed domain row mapping with defensive metadata normalization for invalid DB values.
- Extended mapper payload creation to consistently send normalized replay metadata.
- Added metadata API verification scripts for POST/GET roundtrip and fallback coverage.
- Documented verification flow, fallback philosophy, and compatibility mapping.

## 2026-05-28 (Phase 6-3 replay taxonomy SSOT and query consistency)

- Added centralized replay taxonomy module as SSOT for values, labels, descriptions, tone, and aliases.
- Refactored replay validation to consume taxonomy definitions and unified fallback constants.
- Unified replay labels/tokens with taxonomy-driven generation for severity/continuity/category/source vocabulary.
- Hardened replay query builder to emit canonical continuity values only while parser keeps legacy alias compatibility.
- Added dev-only replay validation observability metrics and runtime visibility section.
- Added Phase 6 taxonomy architecture documentation for SSOT and compatibility flow.

