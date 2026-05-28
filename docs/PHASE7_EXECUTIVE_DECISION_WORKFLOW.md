# Phase 7-1 Executive Decision Workflow

## Objective

Connect replay/governance diagnostics to executive decision workflow visibility so CEOs can identify what to review, why attention is needed, and where to drill down.

## Decision attention architecture

- Added `lib/orchestration/decision-attention/decisionAttention.ts`
  - `DecisionAttentionItem` model
  - `buildDecisionAttentionQueue()`
  - `buildDecisionAttentionSummary()`
- Added UI components:
  - `components/orchestration/DecisionAttentionQueue.tsx`
  - `components/orchestration/DecisionWorkflowSummary.tsx`

## Replay-informed governance review

Decision attention derivation combines:

- replay visibility score
- replay confidence
- continuity diagnostics
- processing review-required state
- runtime governance advisories
- governance memory recurrence signals

This remains recommendation-first and advisory.

## Executive review semantics

Attention severity semantics:

- informational
- advisory
- elevated_review
- executive_focus

No panic semantics are used.

## Continuity-aware decision visibility

Drilldown continuity is preserved with replay query context:

- CEO -> Runtime
- Mission -> Runtime
- Judgment context -> replay diagnostics

## Explainability integration

Governance explainability is now directly embedded across:

- Runtime
- CEO Home
- Mission Detail
- Judgment context summary

## Human-in-the-loop philosophy

Decision attention supports:

- recommendation
- interpretation support
- governance visibility

It does not perform:

- autonomous decision-making
- automatic execution
- AI auto-approval
- automatic task creation
- self-running governance loop

## Intentionally excluded scope

- execution
- autonomous runtime
- MCP integration
- GitHub execution
- deployment and worker processing
