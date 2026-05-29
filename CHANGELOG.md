# Changelog

All notable changes to ProductAI are documented here.

## 2026-05-28

### Added (Phase 7-13 executive decision traceability)

- Executive decision traceability above decision memory atlas with pathways and explainability edges.
- Decision path explorer, traceability inspector, summary, and path timeline components.
- CEO Home traceability summary; Runtime decision traceability; Mission decision path view; Feed CTAs.
- Narrative and journal `relatedDecisionPathways` with traceability navigation links.
- Documentation: `docs/PHASE7_EXECUTIVE_DECISION_TRACEABILITY.md`.

### Added (Phase 7-12 executive decision memory atlas)

- Decision memory atlas above knowledge graph with decision themes and executive memory summary.
- Theme explorer, memory inspector, atlas summary, and theme timeline (interpretation support only).
- CEO Home atlas summary; Runtime decision context; Mission decision context view; Feed atlas CTAs.
- Narrative and journal `relatedDecisionThemes` with atlas navigation links.
- Documentation: `docs/PHASE7_EXECUTIVE_DECISION_MEMORY_ATLAS.md`.

### Added (Phase 7-11 executive governance knowledge graph)

- Governance knowledge graph model, builder, relationship analysis, and localStorage store.
- `GovernanceKnowledgeGraph`, `KnowledgeGraphExplorer`, `RelationshipInspector`, and `KnowledgeGraphSummary` components.
- CEO Home knowledge graph summary; Runtime knowledge context above replay diagnostics.
- Mission relationship view and Organization Feed open knowledge context link.
- Documentation: `docs/PHASE7_EXECUTIVE_KNOWLEDGE_GRAPH.md`.

### Added (Phase 7-10 executive governance narratives and review journeys)

- Executive governance narratives, replay storytelling panels, continuity maps, and review journeys (rule-based only).
- `GovernanceStoryModeSwitcher` with summary, detailed, continuity, and attention story modes.
- Narrative builder, narrative store (localStorage), and governance narrative export on replay share/summary.
- Digest narrative context fields; journal links to narratives and continuity themes.
- Organization Feed governance story CTAs with attention query continuity preserved.
- Documentation: `docs/PHASE7_EXECUTIVE_GOVERNANCE_NARRATIVES.md`.

### Added (Phase 7-9 executive governance workspace and longitudinal replay review)

- Executive governance workspace model, store, and `ExecutiveGovernanceWorkspace` component.
- Governance reading modes with `GovernanceReadingModeSwitcher` and mode-aware `GovernanceWorkspacePanels`.
- Replay review sequencing, longitudinal governance review, and replay reading continuity.
- Journal refinements: pin to workspace, continuity focus tags, digest/comparison context.
- Digest sequencing fields and cross-view workspace links on Organization Feed, Mission, and Judgment.
- Documentation: `docs/PHASE7_EXECUTIVE_GOVERNANCE_WORKSPACE.md`.

### Added (Phase 7-8 replay interpretation history and governance journaling)

- Replay interpretation history store and panel with explicit human-triggered recording.
- Governance journal store, panel, and entry cards (human-authored interpretation only).
- Executive governance digest, replay comparison, interpretation timeline, and executive review session.
- Governance digest export on ReplayShareCard and ReplaySummaryPanel.
- Cross-view integration on CEO Home, Runtime, Mission, Judgment, and Organization Feed.
- Documentation: `docs/PHASE7_REPLAY_INTERPRETATION_HISTORY.md`.

### Added (Phase 7-7 executive replay personalization and governance bookmarking)

- Replay bookmarks (`replayBookmarkStore`, `ReplayBookmarkPanel`) for view continuity across sessions.
- Interpretation presets and `replayPersonalizationStore` with continuity memory and readability mode.
- `ExecutiveReplayWorkspace`, `ReplaySessionRecommendations`, and replay interpretation export context.
- Compact/expanded readability for `ReplaySummaryPanel` and `GovernanceExplainabilityCard`.
- Organization Feed personalization controls (bookmark, preset, continue review).
- Documentation: `docs/PHASE7_EXECUTIVE_REPLAY_PERSONALIZATION.md`.

### Added (Phase 7-6 executive replay onboarding and walkthrough)

- Governance replay walkthrough (`replayWalkthrough.ts`, `GovernanceReplayWalkthrough`) with four interpretive steps.
- Replay example library and `ExecutiveWalkthroughPanel` with diagnostics reuse and scope quick links.
- `ReplayOnboardingSummary`, `replayLiteracy.ts`, and `replayTutorialStore` (localStorage-only).
- Cross-view onboarding on CEO Home, Runtime & Cost, Mission Detail, Judgment, and Organization Feed CTA.
- Documentation: `docs/PHASE7_EXECUTIVE_REPLAY_ONBOARDING.md`.

### Added (Phase 7-5 decision attention seed refresh and development stability)

- Idempotent decision attention seed refresh (`refreshDecisionAttentionSeeds`) with INSERT IF MISSING semantics.
- `FeedRepository.upsertReplaySeedFeedItem` and taxonomy-driven `replaySeedCatalog` for normalized metadata.
- Replay seed diagnostics (`buildReplaySeedDiagnostics`) and `GET/POST /api/feed/replay-seeds`.
- Settings “Replay Development Seeds” section and dev-only Runtime Cost “Replay Seed Status”.
- Organization Feed attention filter stabilization with minimal supplemental continuity examples.
- Verification script: `scripts/verifyReplaySeedRefresh.mjs`.
- Documentation: `docs/PHASE7_REPLAY_SEED_REFRESH.md`.

### Added (Phase 7-4 decision attention hydration and replay continuity)

- Feed merge hardening via `mergeOrganizationFeedItem` to preserve decision attention metadata during hydration.
- Mock/seed decision attention feed events (generated, reviewed, resolved, deferred) with taxonomy-aligned metadata.
- Bootstrap seed alignment for decision attention columns.
- Hydration dev observability and Organization Feed attention count display.
- Verification script: `scripts/verifyDecisionAttentionHydration.mjs`.
- Documentation: `docs/PHASE7_DECISION_ATTENTION_HYDRATION.md`.

### Added (Phase 7-3 decision attention persistence and query continuity)

- Decision attention metadata columns on feed_items with safe idempotent migration.
- Feed repository/API/mapper/service round-trip for decision attention fields and governanceAttention filters.
- Organization Feed attention lifecycle chips with URL-synced governanceAttention query state.
- Cross-view governanceAttention context propagation for CEO, Runtime, Mission, and Judgment.
- Verification script: `scripts/verifyDecisionAttentionFeedMetadata.mjs`.
- Documentation: `docs/PHASE7_DECISION_ATTENTION_PERSISTENCE.md`.

### Added (Phase 7-2 decision attention feed traceability)

- Decision attention metadata fields on organization feed items for lifecycle and replay continuity context.
- Decision attention feed lifecycle events and normalized helper (`buildDecisionAttentionFeedEvent`).
- Governance attention replay query dimension (`governanceAttention`) for cross-view filter portability.
- Organization Feed attention filtering, traceability display, and replay drilldown continuity links.
- Judgment integration for attention lifecycle recording on review actions.
- Documentation: `docs/PHASE7_DECISION_ATTENTION_FEED.md`.

### Added (Phase 7-1 executive decision attention workflow)

- Decision attention derivation module with replay-informed executive review routing.
- Decision Attention Queue and Decision Workflow Summary components for CEO and mission-level visibility.
- Judgment decision context summary integrating replay diagnostics and governance explainability.
- Replay summary extension with decision attention summary semantics.
- Documentation: `docs/PHASE7_EXECUTIVE_DECISION_WORKFLOW.md`.

### Added (Phase 6-6 replay diagnostics explainability completion and governance polish)

- Shared replay diagnostics terminology labels and definitions for consistent cross-view wording.
- Governance explainability portability completion for CEO and Mission views using aligned diagnostics semantics.
- Replay summary and operational panel density wording stabilization via shared helper.
- Replay diagnostics definition block for executive-readable observability guidance.
- Documentation: `docs/PHASE6_COMPLETION_SUMMARY.md`.

### Added (Phase 6-5 cross-view replay diagnostics consistency)

- Replay diagnostics configuration module for weights and thresholds.
- Shared replay diagnostics wording helper for continuity and visibility summaries.
- CEO Home and Mission Detail replay diagnostics summaries with shared continuity semantics.
- Governance explainability portability improvements using direct replay diagnostics props.
- Replay summary and operational replay wording consistency updates for density semantics.
- Documentation: `docs/PHASE6_CROSS_VIEW_DIAGNOSTICS.md`.

### Added (Phase 6-4 replay diagnostics and governance observability)

- Replay diagnostics module with visibility score, confidence semantics, continuity diagnostics, and advisory warnings.
- Governance replay bundle and executive summary integration for diagnostics outputs.
- Runtime replay diagnostics UI block with score, confidence, completeness, density, and warning visibility.
- Explainability and operational replay panel updates for diagnostics context and condensed replay semantics.
- Documentation: `docs/PHASE6_REPLAY_DIAGNOSTICS.md`.

### Added (Phase 6-3 replay taxonomy SSOT and query vocabulary consistency)

- Central taxonomy source module for replay/governance metadata vocabulary.
- Taxonomy-driven replay validation with shared fallback strategy.
- Taxonomy-driven replay labels/tokens for UI chip and label consistency.
- Canonical continuity output hardening in replay query builder with legacy alias parsing support.
- Dev-only replay metadata normalization metrics and runtime observability block.
- Documentation: `docs/PHASE6_METADATA_TAXONOMY.md`.

### Added (Phase 6-2 metadata API verification and safe fallback hardening)

- Replay metadata validation helper for taxonomy normalization and compatibility fallback.
- Feed API metadata normalization for invalid payload tolerance.
- Feed repository/domain defensive normalization for invalid persisted metadata.
- Verification scripts for feed metadata API roundtrip and fallback behavior.
- Documentation: `docs/PHASE6_METADATA_API_VERIFICATION.md`.

### Added (Phase 6-1 backend schema alignment for replay metadata)

- SQLite `feed_items` metadata columns and safe additive bootstrap migration.
- Feed repository metadata persistence/reads and metadata filter support.
- Feed API metadata payload compatibility (POST/GET) and round-trip alignment.
- Replay continuity legacy query normalization in shared parser.
- Documentation: `docs/PHASE6_BACKEND_METADATA_ALIGNMENT.md`.

### Added (Phase 5-10 governance replay metadata stabilization)

- Replay metadata helper for normalized governance/replay feed metadata.
- Continuity category and replay category normalization for feed/query consistency.
- Metadata-driven timeline/feed filtering refinements and reduced message parsing dependency.
- Replay wording consistency updates across summary/explainability/panel surfaces.
- Documentation: `docs/PHASE5_COMPLETION_SUMMARY.md`.

### Added (Phase 5-9 governance replay filtering and readability polish)

- Metadata-driven governance feed filtering model and feed metadata fields.
- Queue feed metadata normalization via `queueFeedMetadata()`.
- Runtime replay chip-based filter consolidation and reduced select usage.
- Replay window semantics mapped to timeline visibility ranges.
- Replay summary extensions for visible events and timeline density context.
- Documentation: `docs/PHASE5_REPLAY_POLISH.md`.

### Added (Phase 5-8 unified governance replay query architecture)

- Shared replay query layer (`lib/replay-query`) with unified state and helpers.
- Single replay schema across Runtime, Feed, CEO, and Mission view routing.
- Replay scope/window switcher components and query summary/navigation context UI.
- Executive replay summary extended with scope/window/continuity severity context.
- Documentation: `docs/PHASE5_REPLAY_QUERY_SCHEMA.md`.

### Added (Phase 5-7 shareable executive governance replay views)

- Full Runtime replay query sync for mission/eventType/severity/source/reasonCategory/continuity/advisory/review.
- Organization Feed `gov` chip ↔ URL bidirectional sync for portable governance filtering.
- Portable executive query schema application in CEO Home and Mission Detail views.
- Replay snapshot persistence store with local-first continuity history.
- Historical governance trend card (health, review, runtime, advisory density).
- Executive replay summary model + generation and replay summary panel.
- Replay share/export actions (copy summary, share replay view URL).
- Documentation: `docs/PHASE5_EXECUTIVE_REPLAY.md`.

### Added (Phase 5-6 governance memory and operational replay)

- Governance history architecture and timeline event model (`governance-history` modules).
- Executive governance snapshot generator for point-in-time operational context.
- Runtime & Cost operational replay panel with calm timeline and event filters.
- Mission governance history panel with timeline and readiness-change context.
- Memory Vault governance memory section for recurring governance patterns.
- Historical continuity explanation in explainability card.
- Organization Feed timeline/memory event integration and filter support.
- Documentation: `docs/PHASE5_GOVERNANCE_MEMORY.md`.

### Added (Phase 5-5 governance analytics explainability and navigation)

- URL-synced processing governance analytics filters and shareable runtime views.
- Explainable governance continuity scoring model and contribution breakdown.
- Executive drilldown navigation from analytics cards to mission/task/review contexts.
- Mission label normalization helper across governance visibility surfaces.
- Organization Feed governance analytics filter chips for continuity and review events.
- Documentation: `docs/PHASE5_GOVERNANCE_EXPLAINABILITY.md`.

### Added (Phase 5-4 processing governance visibility analytics)

- Processing governance analytics module with severity/category/risk distributions.
- Governance continuity scoring and executive visibility summary model.
- Runtime & Cost processing analytics card, review queue, and calm filtering controls.
- Mission-level processing governance summary and CEO risk visibility section.
- Task-level processing reason filters for executive reviewability.
- Documentation: `docs/PHASE5_PROCESSING_VISIBILITY.md`.

### Added (Phase 5-3 processing review governance taxonomy)

- Processing reason taxonomy and structured governance reason model.
- Processing review policy gates for review_required resume/deny/revoke flow.
- Processing review UI actions and reason visibility cards.
- Processing audit continuity extension for review and reason events.
- Runtime & Cost processing governance review section.
- Documentation: `docs/PHASE5_PROCESSING_REVIEW_POLICY.md`.

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
