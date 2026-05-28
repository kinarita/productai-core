# Phase 4-3 — Controlled Execution Handoff

## Objective

Connect AI proposals and execution plans to **human-approved execution handoff** — without autonomous execution, MCP/GitHub runs, or background workers.

## Architecture

```
AI Proposal (approved + execution_planned)
        ↓
Execution Plan (advisory)
        ↓
Execution Ticket (draft → awaiting_handoff)
        ↓
CEO Approval Signature
        ↓
handoff_approved (boundary only — no execute)
        ↓
[Future] queued → executing → completed
```

Modules: `lib/orchestration/execution/`

| File | Role |
|------|------|
| `executionTypes.ts` | Ticket, signature, target, audit types |
| `executionPolicy.ts` | Handoff approval rules, target inference |
| `executionHandoff.ts` | Ticket creation, approve/reject |
| `executionAudit.ts` | Audit messages and feed copy |
| `executionAdapters.ts` | Adapter interface + mock boundaries |

## ExecutionTicket

Statuses in this phase: `draft`, `awaiting_handoff`, `handoff_approved`, `cancelled`.

Future: `queued`, `executing`, `completed`.

Fields include `proposalId`, `missionId`, `executionTarget`, `executionIntent`, `riskLevel`, linked `executionPlan`, optional `approvalSignature`.

## Approval signature

Records CEO explicit authorization:

- actor, role, approvedAt, approvalType (`execution_handoff`), governanceNote

Purpose: operational proof that handoff was human-authorized.

## Execution targets (abstract only)

- MCP
- GitHub
- ClaudeCode
- InternalAgent
- RuntimeOperation

Adapters implement `prepareExecution`, `validateExecution`, `describeExecutionBoundary` — **mock only**, always returns execution disabled.

## Human-in-the-loop philosophy

| Actor | May |
|-------|-----|
| AI agents | Propose, analyze, prepare plans, prepare handoff |
| Human (CEO) | Authorize execution handoff |

Autonomous execution, repo modification, deploy, and MCP actual runs remain forbidden.

## Audit trail

Local `executionStore.auditLog` records:

- ticket_created
- handoff_submitted
- approval_granted / approval_rejected

Organization Feed receives handoff governance events from Executive Sync.

## Persistence

In-memory Zustand (`executionStore`). No database persistence in this phase.

## Future direction

- Queue handoff-approved tickets for controlled workers
- Persist tickets and signatures to SQLite
- Wire real MCP/GitHub adapters behind policy gates
- Task creation from approved plans (separate human action)

## Scope boundaries

- No autonomous execution
- No background workers
- No GitHub/MCP/Claude Code actual execution
- No deployment automation or auto merge/PR