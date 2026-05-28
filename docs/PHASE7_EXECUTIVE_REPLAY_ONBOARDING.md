# Phase 7-6 — Governance Replay Onboarding & Executive Walkthrough

## Purpose

Connect existing Replay, Governance, Decision Attention, and Diagnostics capabilities into an explainable onboarding path for executives and product leaders—without autonomous execution.

## Replay onboarding philosophy

- **Understanding first**: Replay is a readability layer for governance continuity, not an automation trigger.
- **Human-in-the-loop**: Walkthrough steps end in human interpretation, not system action.
- **Metadata-driven**: Examples and drilldowns use `buildReplayHref()` for query continuity.
- **Local tutorial state only**: Dismissal and step completion persist in browser localStorage.

## Executive literacy

`replayLiteracy.ts` provides:

- `buildReplayLiteracySummary()` — visibility, completeness, confidence framing
- `buildContinuityInterpretation()` — stability and continuity wording
- `buildGovernanceAttentionInterpretation()` — attention count and lifecycle context

Definitions reuse `replayDiagnosticsLabels.ts`.

## Governance interpretation semantics

Walkthrough steps cover:

1. Replay visibility (score, completeness, confidence)
2. Continuity review (density, concentration)
3. Governance attention (memory, recurring review)
4. Human interpretation boundary (no operational execution from diagnostics)

## Continuity walkthrough

`GovernanceReplayWalkthrough` steps through `replayWalkthrough.ts` with optional `relatedReplayQuery` per step.

## Replay example library

`replayExampleLibrary.ts` ships shareable examples:

- Runtime continuity review
- Governance concentration
- Recurring advisory pattern
- Elevated review density
- Executive replay overview

Each example links to Runtime, Feed, CEO Home, or Judgment with preserved query state.

## Cross-view placement

| View | Component |
|------|-----------|
| CEO Home | `ExecutiveWalkthroughPanel` |
| Runtime & Cost | `ExecutiveWalkthroughPanel` |
| Mission Detail | `ExecutiveWalkthroughPanel` (compact) |
| Judgment | `ExecutiveWalkthroughPanel` (compact) |
| Organization Feed | “Open replay walkthrough” CTA |

## Tutorial store

`replayTutorialStore.ts`:

- `dismissed`, `completedSteps`, `lastViewedReplayScope`
- localStorage persistence only

## Intentionally excluded scope

- Autonomous execution, MCP/GitHub execution, background workers
- Auto-governance, automatic replay actions, self-healing
- Alert escalation engines, tutorial gamification, AI hype / war-room language

## Operational tone

Preferred: *Replay diagnostics support continuity interpretation across governance workflows.*

Avoid: *The AI system continuously monitors and reacts automatically.*
