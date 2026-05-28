# Phase 5-1 — Controlled Execution Start Stub

## Objective

Introduce a governance layer that transitions `execute_ready` into an active execution session state without performing any real execution.

## Architecture

`lib/orchestration/execution-start/`

- `executionStartTypes.ts`: session/signature/audit models
- `executionSession.ts`: session and operator signature builders
- `executionStartPolicy.ts`: request/start/revoke policy gates
- `executionStartAudit.ts`: execution start governance audit messages
- `executionBoundaryConfirmation.ts`: boundary confirmation summary

Store:

- `lib/store/executionSessionStore.ts`

## Lifecycle extension

`execute_ready`
→ `execution_start_requested`
→ `execution_started`
→ `execution_session_active`

Side states:

- `execution_start_denied`
- `execution_start_revoked`

`execution_session_active` means governance-active only. No code execution starts.

## Operator signature

Execution start requires a final operator signature that confirms:

- execution authorization accepted
- governance boundary accepted
- operator note recorded

## Runtime reservation

Execution sessions include a mock runtime reservation record to indicate governance-level reservation intent only.
No runtime resource allocation is executed.

## Human-in-the-loop

AI may:

- request execution start
- validate readiness and boundary summary

Only humans may:

- confirm execution boundary
- mark session active

## Scope boundary

- No MCP/GitHub/Claude Code execution
- No background execution
- No autonomous worker processing
