# Phase 9-4 — Product Brief Workspace

## Objective

Formal planning approval layer for Product Briefs: Planner → CEO Review → CEO Approval → Director Handoff Ready—human authorization only.

## Principle

**CEO approves · AI organizes · Director receives approved planning only**

## Scope

### Library

- `productBriefWorkspace.ts` — brief record model
- `productBriefStatus.ts` — seven brief states
- `productBriefReview.ts` / `productBriefApproval.ts` — review and approval context
- `productBriefAnalysis.ts` — board, history, planner/director views, handoff candidates
- `productBriefFeed.ts` — feed helpers
- `productBriefWorkspaceStore.ts` — `productai-product-brief`

### UI

- `/product-brief` — board, review, approval, history, summary
- CEO Home Product Brief Overview
- Mission Team Planner and Director panels
- Idea Workspace, Artifact Review, Team Handoff, Lifecycle integration

## Product Brief States

Draft · Under Review · Review Requested · Changes Requested · Approved · Director Handoff Ready · Archived

## Persistence

localStorage `productai-product-brief`: `selectedBriefId`, `selectedMissionId`, `selectedStatus`, `selectedView`

## Feed Events

`product_brief_created`, `product_brief_reviewed`, `product_brief_changes_requested`, `product_brief_approved`, `director_handoff_ready`, `product_brief_snapshot`

## Out of Scope

Auto approval, auto mission/task creation, auto handoff, execution, GitHub, MCP, deployment

## Next Phase

Phase 9-5 — Mission Planning Workspace (Director receives approved briefs for Mission Plan, Delivery Plan, Task Breakdown, Review Schedule)
