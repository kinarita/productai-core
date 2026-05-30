# Phase 15 — Agent Audit Framework

## Vision

ProductAI value is **explainability**: every agent records Input → Analysis → Decision → Why → Output. Decision Trail is built from agent-agnostic audit records—not Planner-only fields.

## Architecture

| Layer | Path |
|-------|------|
| Core types | `lib/agents/audit/agentAuditTypes.ts` |
| Selectors | `lib/agents/audit/agentAuditSelectors.ts` |
| Prompt hash | `lib/agents/audit/promptHash.ts` (SHA-256, no full prompts) |
| Decision Trail prep | `lib/agents/audit/decisionTrailFromAudits.ts` |
| Store | `lib/store/agentRunsStore.ts` → localStorage `productai-agent-runs` |
| Planner facade | `lib/store/plannerAgentStore.ts` (Phase 14 API unchanged) |

## Storage

```text
runs["{missionId}:{agentId}"] → AgentRun
auditTrail[]                  → append-only AgentAuditRecord[]
```

## Audit record (every execution)

- Success: `status: "success"`, `output` set
- Failure: `status: "failed"`, `errorMessage`, `output` undefined
- Always: `id`, `missionId`, `agentId`, `model`, `providerId`, `promptVersion`, `promptHash?`, `input`, `reasoning`

## Planner migration

- `PlannerAuditRecord` = `AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult>`
- Legacy `productai-planner-agent` migrated on rehydrate, then removed
- Run key: `{missionId}:product_planner` (was `{missionId}` only)

## Decision Trail

Selectors: `getMissionAuditTrail`, `getAgentAuditTrail`, `getLatestAgentRun`

UI: `AgentAuditTrailPanel` on `/artifact-lineage` when a mission is selected (multi-agent ready; only Planner runs today).

## Out of scope (Phase 15)

- Architect / Designer / Developer / QA agent execution
- New workflows
- Full prompt storage

## Env (Planner unchanged)

See `docs/PHASE14_PRODUCT_PLANNER_AGENT.md` for `PLANNER_PROVIDER`, `OPENAI_*`, `ANTHROPIC_*`.
