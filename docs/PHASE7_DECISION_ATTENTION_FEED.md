# Phase 7-2 Decision Attention Feed Traceability

## Objective

Connect decision attention to replay/governance feed traceability so executive review context can be followed across Feed, Replay, and Judgment.

## Decision attention feed architecture

- Added decision attention metadata fields to `OrganizationFeedItem`.
- Added lightweight governance feed events:
  - `decision_attention_generated`
  - `decision_attention_reviewed`
  - `decision_attention_resolved`
  - `decision_attention_deferred`
- Added `buildDecisionAttentionFeedEvent()` in queue feed helpers for normalized event construction.

## Replay-driven review traceability

Decision attention feed events now include replay-informed context:

- replay visibility score (in event message)
- replay confidence
- continuity stability
- replay window tags
- governance memory linkage tags

## Governance attention lifecycle

Lifecycle is intentionally lightweight and non-automated:

- generated
- reviewed
- resolved
- deferred

No autonomous routing or forced action occurs.

## Metadata alignment

Decision attention feed events are normalized through replay metadata taxonomy:

- governance category
- replay category
- continuity category
- replay severity
- replay source
- advisory level

## HITL review semantics

All decision attention records are recommendation-first visibility artifacts for human review.

## Intentionally excluded scope

- autonomous decisions
- automatic approvals
- execution/runtime orchestration
- MCP or GitHub execution flows
- self-running governance loops
