# Phase 4-6 — Human Execution Authorization

## Objective

Introduce a human authorization boundary for queue items in `awaiting_execution_authorization`, with intent review and audit continuity.

## Authorization architecture

`lib/orchestration/authorization/`

- `authorizationTypes.ts`: request/signature/audit models
- `executionAuthorization.ts`: request and signature builders
- `authorizationPolicy.ts`: request/authorize/revoke gates
- `authorizationAudit.ts`: authorization audit messages and entries

Store:

- `lib/store/executionAuthorizationStore.ts`

## Lifecycle

`awaiting_execution_authorization`
→ `authorization_requested`
→ `execution_authorized`

Additional outcomes:

- `denied`
- `revoked`

No execution is started in this phase.

## Policy boundary

Required for authorization:

- queue status is authorization-eligible
- readiness score threshold met
- runtime lock inactive
- provenance continuity present
- governance continuity present

Forbidden conditions:

- runtime degradation advisory lock
- unresolved blockers
- missing provenance
- missing governance continuity

## Execution intent review

Task detail and queue cards expose:

- execution target
- governance summary
- readiness score
- runtime risk
- dependency blocking conditions
- approval continuity

## Human-in-the-loop rule

AI agents may:

- prepare execution
- validate readiness
- request authorization

Only humans may:

- authorize execution
- deny authorization
- revoke authorization

## Scope boundary

- No actual execution
- No MCP/GitHub/Claude Code execution
- No autonomous queue processing or background execution
