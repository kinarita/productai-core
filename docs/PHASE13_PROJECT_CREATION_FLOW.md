# Phase 13 — Project Creation Flow

Version: 1.0  
Date: 2026-05-30  
Status: Implemented

---

## Objective

Transform the home experience from a passive dashboard into an **AI software creation platform** where a first-time user can describe an idea, start the AI team, and see planning begin within **2 minutes**.

---

## User flow

1. **Hero** on `/` — “What would you like to build?” + examples + **Start AI Team**
2. **Wizard** (4 steps): Project Idea → Target Users → Success Goal → Create Project
3. **Create** — new mission, Product Planner assigned, Product Brief in `requirementsSummary`
4. **Redirect** to `/projects/[missionId]` — timeline, AI team status, activity feed, brief preview

---

## Features

| # | Feature | Implementation |
|---|---------|----------------|
| 1 | Create project experience | `ProjectCreationHero` |
| 2 | Project creation wizard | `ProjectCreationWizard` |
| 3 | Auto team assignment | `projectCreationStore.createProject` — Planner + brief |
| 4 | Project timeline | `ProjectTimeline` — Idea → Release |
| 5 | Activity feed | `ProjectActivityFeed` + persisted activities |

---

## Data (no Mission schema change)

- New missions appended via `useMissionStore.setState`
- Metadata + activity in `productai-project-creation` (localStorage)
- Organization feed event on create
- Brief text stored in existing `mission.requirementsSummary`

---

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Hero + project list |
| `/projects/[missionId]` | Project hub after creation |

Legacy workspaces (`/product-brief`, `/idea-workspace`, etc.) remain available.

---

## Scope boundaries

- No autonomous code execution, GitHub, or MCP
- Brief generation is deterministic template from wizard inputs (not live LLM call)

---

## Success criteria (manual)

Within 2 minutes a new user can:

1. Enter an app idea  
2. Click Start AI Team and complete the wizard  
3. See Product Planner assigned and Product Brief + activity on the project hub  
