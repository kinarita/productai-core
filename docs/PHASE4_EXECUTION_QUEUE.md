# Phase 4-5 — Controlled Execution Queue

## Objective

Connect execution-ready operational tasks to a **Controlled Execution Queue** with worker preparation, execution gating, runtime lock, and reservations — without actual execution.

## Architecture

```
execution_ready task
        ↓
executionGate.canQueueExecution()
        ↓
ExecutionQueueItem (queued)
        ↓
Reserve Execution Slot (reserved)
        ↓
workerPreparation.prepareWorker() (worker_prepared)
        ↓
Complete Preparation Review (awaiting_execution_authorization)
        ↓
[Future] human authorize → executing
```

Modules: `lib/orchestration/queue/`

| File | Role |
|------|------|
| `executionQueueTypes.ts` | Queue item, lifecycle, runtime lock |
| `executionGate.ts` | canQueue / canPrepare / canAuthorize |
| `workerPreparation.ts` | Validation summary (no execute) |
| `executionReservation.ts` | Reserve / release |
| `executionQueueManager.ts` | Item factory |
| `readinessScore.ts` | 0–100 readiness |
| `queueFeed.ts` | Feed message copy |

Store: `executionQueueStore` (in-memory)

## Queue lifecycle

| Status | Meaning |
|--------|---------|
| `execution_ready` | Eligible, not yet enqueued |
| `queued` | In controlled queue |
| `reserved` | Slot reserved (COO / Observer / Operator) |
| `worker_prepared` | Preparation validation passed |
| `awaiting_execution_authorization` | Ready for human execution auth only |

Future: `executing`, `completed`

## Execution gating

**Required:** governance provenance, handoff signature, stable-enough runtime, valid boundary.

**Forbidden:** degraded runtime (blocks prepare), missing provenance, unresolved blockers, autonomous authorize.

`canAuthorizeExecution()` always returns false in this phase — human-only future gate.

## Runtime lock

When sync/alert thresholds exceeded:

- Queue progression paused (advisory)
- Worker preparation stopped
- No automated recovery

## Readiness score

Weighted 0–100 from: governance approved, runtime stable, dependencies, sync health, provenance complete.

## Human-in-the-loop

| Actor | May |
|-------|-----|
| AI | Prepare, validate, reserve slots |
| Human | Authorize actual execution (future) |

## Scope boundaries

- No MCP / GitHub / Claude Code execution
- No background workers or autonomous queue processing
- No deployment or self-running loops