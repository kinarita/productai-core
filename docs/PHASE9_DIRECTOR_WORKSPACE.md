# Phase 9-5 — Director Workspace (Mission Planning Workspace)

## Objective

Bridge CEO → Product Planner → Director → Architect by visualizing approved Product Brief through Mission Plan, Delivery Plan, Task Breakdown, Review Schedule, and Architect Handoff readiness.

## Principle

**Planning support only · Human authorization only · No auto mission/task creation or Architect handoff**

## Route

`/director-workspace` — deep link `?brief={id}&mission={id}`

## Sections

1. **Product Brief Intake** — approved brief fields for Director receipt
2. **Mission Plan** — `MissionPlanRecord` (display only)
3. **Delivery Plan** — phases, milestones, target reviews, release goal
4. **Task Breakdown** — existing tasks organized by role/stage (no auto generation)
5. **Review Schedule** — planned / scheduled / completed
6. **Dependency Map** — card list (brief, mission, related missions, repository, release)
7. **Architect Handoff Readiness** — readiness areas and recommendation-only status

## Persistence

localStorage `productai-director-workspace`: `selectedMissionId`, `selectedBriefId`, `selectedView`, `selectedReviewState`

## Feed Events

`director_plan_created`, `director_plan_review_requested`, `director_dependency_identified`, `director_handoff_candidate`, `director_snapshot`

## Integrations

- CEO Home — Director Planning Overview
- Product Brief Workspace — Open Director Workspace link
- Mission Team — Architect Handoff Candidates panel
- Sidebar navigation

## Out of Scope

Auto mission/task creation, auto assignment, auto approval, execution, GitHub, MCP, deployment, Architect Workspace (Phase 10+)

## Flow

CEO → Idea Workspace → Product Brief → CEO Approval → **Director Workspace** → Architect Handoff Candidate
