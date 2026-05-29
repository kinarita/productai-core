# Phase 8-6 — Product Lifecycle Workspace

## Objective

Integrate existing Phase 8 workspaces into one executive-readable product journey view: Idea → Planning → Direction → Architecture → Design → Development → QA → Release → Outcome. No new execution, automation, or stage advancement.

## Scope

### Library

- `productLifecycle.ts` — nine lifecycle stages, advisory note, stage helpers
- `lifecycleAnalysis.ts` — stage inference, mission lifecycle view, stage board, journey
- `lifecycleTimeline.ts` — per-mission timeline and mission lifecycle context
- `lifecycleSummary.ts` — organization overview (ideas, planning, development, QA, release, outcomes)
- `lifecycleFeed.ts` — feed helpers for lifecycle events
- `lifecycleWorkspaceStore.ts` — `productai-lifecycle-workspace`

### UI

- `/product-lifecycle` — timeline, board, mission view, journey, summary, context
- CEO Home Product Lifecycle Overview
- COO Open Product Lifecycle link
- Mission Detail Lifecycle Context panel
- Organization Feed lifecycle events

## Lifecycle Stages

Idea · Planning · Direction · Architecture · Design · Development · QA · Release · Outcome

Stage inference uses existing mission workflow, release state, and outcome signals—visualization only.

## Persistence

localStorage key `productai-lifecycle-workspace` stores `selectedMissionId`, `selectedStage`, `selectedView`.

## Feed Events

- `lifecycle_stage_changed`
- `lifecycle_snapshot`
- `lifecycle_context_updated`

## Out of Scope

GitHub API, deploy, MCP, Claude Code execution, agent autonomy, auto planning, auto prioritization, automatic stage advancement

## Next Phase

Phase 9 — AI Team Operations (CEO → COO → Planner → Director → Architect → Designer → Developer → QA collaboration flow, still no execution)
