# Phase 4-4 — Controlled Task Materialization

## Objective

Convert approved execution handoffs into **execution-ready operational tasks** with full provenance — without autonomous execution.

## Architecture

```
Execution Plan (advisory)
        ↓
Execution Ticket (handoff_approved + signature)
        ↓
Materialization Policy validation
        ↓
taskMaterializer → Task[] with provenance
        ↓
execution_ready operational tasks
```

Modules: `lib/orchestration/materialization/`

| File | Role |
|------|------|
| `materializationTypes.ts` | Records and readiness summary |
| `materializationPolicy.ts` | canMaterialize / boundary validation |
| `taskMaterializer.ts` | Plan → Task conversion |
| `provenanceTracker.ts` | Provenance builders and queries |
| `executionQueue.ts` | Queue visualization (no execution) |

## Materialization lifecycle

| Status | Meaning |
|--------|---------|
| `execution_planned` | Plan exists on proposal/ticket |
| `materialization_requested` | Governance review requested |
| `materialized` | Tasks created (intermediate) |
| `execution_ready` | Operational tasks ready (no auto-run) |

## Task provenance

Tasks created via materialization include:

- `createdFromProposalId`
- `createdFromExecutionTicketId`
- `createdFromExecutionPlanId`
- `governanceApprovedBy`
- `materializedAt`
- `executionReadiness`: planning | governance_reviewed | execution_ready | blocked
- `governanceNotes` / `executionBoundaryNote`

`createdFrom`: `"materialization"`

## Materialization policy

`canMaterializeExecutionPlan()` requires:

- Handoff approved
- Governance signature present
- Execution plan linked
- Runtime stability (blocks when sync/alert thresholds exceeded)
- High-risk: materialization review first

## Human-in-the-loop

| Actor | Capability |
|-------|------------|
| AI | Propose, plan, prepare handoff |
| Human | Approve handoff, authorize materialization |

Materialized tasks are **not auto-executed**.

## Governance continuity

- Task Detail: Governance Provenance section
- Mission Detail: Execution Readiness summary
- Runtime & Cost: Organization readiness + queue
- Organization Feed: materialization operationalization events

## Execution queue (visualization only)

States: `pending` | `governance_ready` | `execution_ready`

No workers, no MCP/GitHub runs.

## Future direction

- Persist materialization records to SQLite
- Controlled queue → worker handoff (policy-gated)
- Real adapter execution behind separate CEO gate

## Scope boundaries

- No autonomous execution
- No MCP / GitHub / Claude Code / deploy
- No background workers or realtime loops