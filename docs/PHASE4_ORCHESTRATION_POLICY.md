# Phase 4-2 — Orchestration Governance & Approval Flow

## Objective

Introduce a policy foundation so the AI organization can move from thinking to **safe proposal, approval, and execution planning** — without autonomous execution.

## Governance architecture

```
AI Agents (COO / Architect / QA / Runtime Observer)
        ↓
Orchestrator (generate proposals, plans, recommendations)
        ↓
Policy layer (`lib/orchestration/policy/`)
  ├── orchestrationPolicy — lifecycle + proposal factories
  ├── approvalPolicy — CEO approval boundaries
  └── executionPolicy — allowed vs forbidden capabilities
        ↓
Human approval (CEO / executive actions in UI)
        ↓
Execution plan (advisory only — no auto task creation)
```

## Proposal lifecycle

| Status | Meaning |
|--------|---------|
| `proposal` | Draft structured output |
| `approval_required` | CEO gate active |
| `approved` | Human approved; planning may proceed |
| `revision_requested` | CEO requested changes |
| `rejected` | Closed without planning |
| `execution_planned` | Advisory execution plan generated |

Future (not in Phase 4-2): `executing`, `completed`.

## Approval policy

CEO approval is required for:

- Architecture changes
- Release decisions
- Dependency escalation (when blocked)
- Runtime recovery recommendations
- High-risk proposals

Not required for:

- Informational summaries
- Low-risk operational suggestions

Function: `requiresCEOApproval(proposal)` in `approvalPolicy.ts`.

## Execution boundary

**Allowed:** summarize, propose, analyze, recommend, generate execution plan.

**Forbidden:** deploy, modify repository, merge PR, delete data, execute code automatically, auto recovery, background workers.

Defined in `executionPolicy.ts` with `getExecutionPolicy()`.

## UI integration

- **Executive Sync:** structured proposals with Approve / Request Revision / Reject; execution plan generation after approval.
- **Judgment Center:** governance note, execution impact, approval boundary on AI recommendations.
- **Runtime Observer:** recommendation-only; no automated recovery.
- **Organization Feed:** governance events (approval requests, architect review, runtime recommendations).
- **Components:** `ProposalCard`, `ApprovalBadge`, `RiskIndicator`, `GovernanceNote`.

## Persistence

Proposals and execution plans use in-memory Zustand (`proposalStore`) — no database persistence in this phase. Governance events may appear in Organization Feed.

## Future direction (Phase 5+)

- Task creation from approved execution plans (still human-gated)
- Persistent proposal audit trail
- Controlled execution workers with policy enforcement
- MCP / GitHub integration behind explicit approval gates

## Scope boundaries (maintained)

- No autonomous execution
- No automatic task creation
- No background workers
- No MCP / GitHub / deployment automation
- No self-improving agent loops
- No realtime orchestration