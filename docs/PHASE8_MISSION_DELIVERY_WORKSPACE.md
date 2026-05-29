# Phase 8-2 — Mission Delivery Workspace

## Objective

Add a Mission Delivery Workspace so the CEO can read task progress, ownership, review status, repository state, and release readiness across the Mission → Task → Review → Repository → Release chain—visibility only.

## Scope

### New library modules

- `lib/delivery/deliveryWorkspace.ts` — delivery pipeline stage model
- `lib/delivery/deliveryPipeline.ts` — task pipeline rows and stage inference
- `lib/delivery/taskDeliveryAnalysis.ts` — mission summaries, bottlenecks, delivery context
- `lib/delivery/taskOwnership.ts` — Mission Team role ownership buckets
- `lib/delivery/reviewStatus.ts` — review state and aggregation
- `lib/delivery/repositoryStatus.ts` — repository states (no connection)
- `lib/delivery/releaseReadiness.ts` — release blockers and readiness view
- `lib/delivery/deliveryFeed.ts` — delivery feed event helpers
- `lib/store/deliveryWorkspaceStore.ts` — `productai-delivery-workspace` localStorage
- `lib/hooks/useDeliveryWorkspace.ts` — composed delivery data hook

### New UI

- `components/delivery/MissionDeliveryWorkspace.tsx` — full workspace + `MissionDeliveryContextPanel`
- `components/delivery/TaskPipeline.tsx`, `TaskBoard.tsx`, `TaskOwnershipPanel.tsx`
- `components/delivery/ReviewStatusPanel.tsx`, `RepositoryStatusPanel.tsx`, `ReleaseReadinessPanel.tsx`
- `components/delivery/DeliverySummaryCard.tsx` — overview + per-mission summaries
- `components/delivery/DeliveryWorkspaceView.tsx`
- `app/delivery-workspace/page.tsx`

### Integrations

- **CEO Home** — Delivery Overview card
- **Mission Detail** — Mission Delivery Context panel + link to delivery workspace
- **COO Workspace** — Open Delivery Workspace link
- **Organization Feed** — delivery event types (visualization only)
- **Sidebar** — Delivery Workspace navigation

## Delivery Pipeline Stages

Task Planning → Ready → In Progress → Review → Repository Ready → Release Ready → Released

## Task Model (Pipeline)

Task Title, Mission, Assigned Role, Status, Review State, Repository State, Delivery Stage, Updated At

## Task Ownership Roles

Product Planner, Director, Architect, Designer, Developer, QA Reviewer — with assigned / active / review / blocked counts

## Review Status Aggregation

Pending Review, In Review, Review Completed, Review Blocked, Review Notes Count

## Repository Status (Visualization Only)

No Repository, Repository Planned, Repository Linked, Repository Ready — derived from mission branches/PRs and task state. No GitHub connection.

## Release Readiness

Release Blockers, QA Status, Documentation Status, Review Status, Readiness Summary

## Delivery Bottlenecks (Rule-Based)

- Review stall (multiple in review)
- Task state dwell (blocked + stale eta)
- QA wait concentration
- Repository ready stall
- Release ready stall

## Out of Scope

- GitHub / Claude Code / MCP execution
- Automatic task creation, delegation, or prioritization
- Repository Coordination Workspace (Phase 8-3)
