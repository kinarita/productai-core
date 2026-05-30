# Phase 16 — Planner Clarification Questions

## Goal

Product Planner behaves as an **AI Product Manager**: assess completeness before any Product Brief, ask clarification questions when needed, then generate the brief after answers (up to 3 rounds).

## Flow

```
User input → Assess → (Clarification loop) → Product Brief
```

## States

`idle` → `assessing` → `awaiting_clarification` (optional) → `working` → `completed` | `failed`

## API

| Route | Purpose |
|-------|---------|
| `POST /api/agents/planner/assess` | Step 1 — completeness assessment |
| `POST /api/agents/planner/clarify` | Submit answers — re-assess or generate brief |
| `POST /api/agents/planner/generate` | Step 2 — brief only when sufficient |

## Audit (Phase 15)

Every assess/clarify/brief cycle appends to `auditTrail` with `clarificationRound`, `assessment`, `missingAreas`, `promptHash`.

## UI

- `ProjectPlannerQuestionsPanel` — question, reason, answer, Submit Answers
- Timeline: Idea → Clarification → Planning → Review → …
- AI Team: Assessing Requirements / Awaiting Clarification / Planning

## Constraints

No Architect agent, no human approval workflow, no auto-missions.
