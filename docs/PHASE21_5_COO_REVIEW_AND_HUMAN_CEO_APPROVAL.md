# Phase 21.5 — COO Review Rename + Human CEO Approval

## Objective

Separate **AI advisory** from **human authorization**:

```text
AI analyzes (COO recommendation)
Human decides (CEO approval)
```

## Workflow

```text
Planner → COO Review (AI) → CEO Approval (Human) → Architect
```

## Roles

| Role | Actor | Responsibility |
|------|-------|----------------|
| COO Review | AI (`coo_reviewer`) | Executive recommendation — PROCEED / VALIDATE MORE / HOLD |
| CEO Decision | Human user | Final approve / validate / hold |

Architect unlocks **only** when `executiveDecision === "approved"`.

## Types

- `CooReviewReport.recommendation` — AI COO output (not final)
- `ExecutiveDecisionStatus` — `awaiting_ceo_approval` \| `approved` \| `hold` \| `needs_validation`

## Migration (Phase 21 → 21.5)

Legacy `ceoReviewReport` with `decision: PROCEED` becomes:

- `cooReviewReport.recommendation = PROCEED`
- `executiveDecision = awaiting_ceo_approval`

No project is auto-approved.

## UI

- `CooReviewCard` — Recommendation badge + COO disclaimer
- `CeoDecisionCard` — Approve & Continue / Request More Validation / Put On Hold

## Pipeline stages

Planning → COO Review → CEO Approval → Architecture → Build → QA → Release

## Files

- `lib/coo-review/`
- `lib/agents/coo/runCooReview.ts`
- `POST /api/agents/planner/coo-review`
- `components/projects/CooReviewCard.tsx`
- `components/projects/CeoDecisionCard.tsx`
