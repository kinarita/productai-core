# Phase 9-3 — CEO Idea Workspace

## Objective

ProductAI's entry point: CEO captures ideas, Product Planner organizes, Product Brief connects to Artifact Review and Team Handoff—no automatic mission or task creation.

## Principle

**CEO thinks · AI organizes · CEO approves**

## Scope

### Library

- `ideaWorkspace.ts` — idea model and states
- `ideaAnalysis.ts` — ideas from missions, overview, planner view, handoff-ready briefs
- `productBrief.ts`, `problemDiscovery.ts`, `valueProposition.ts`, `mvpScoping.ts`, `featurePrioritization.ts`
- `ideaFeed.ts` — feed helpers
- `ideaWorkspaceStore.ts` — `productai-idea-workspace`

### UI

- `/idea-workspace` — canvas, problem, value, MVP, features, brief, summary
- CEO Home Idea Workspace Overview
- Mission Team Product Planner panel
- Lifecycle, Artifact Review, Team Handoff integration

## Idea States

Captured · Exploring · Refining · Product Brief Draft · Ready For Review · Approved · Archived

## Persistence

localStorage `productai-idea-workspace`: `selectedIdeaId`, `selectedView`, `selectedStatus`, `selectedProductBrief`

## Feed Events

`idea_captured`, `idea_refined`, `product_brief_drafted`, `product_brief_review_requested`, `product_brief_approved`, `idea_snapshot`

## Out of Scope

Auto planning, auto approval, auto mission/task creation, agent self-planning, execution, GitHub, MCP, deployment

## Next Phase

Phase 9-4 — Product Brief Workspace (formal CEO Review → Director planning approval flow)
