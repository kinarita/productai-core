# Phase 21A — PMF Readiness UX Correction

## Objective

Separate **pre-launch PMF Readiness** from **actual Product-Market Fit** so early-stage projects are not misread as “low PMF.”

## Concepts

| Field | Meaning |
|-------|---------|
| `PmfReadiness` (per-stage scores) | Discovery-stage confidence 0–100 |
| `pmfReadinessScore` | Aggregate pre-launch readiness (NOT achieved PMF) |
| `pmfMeasurementStatus` | `not_measured` \| `emerging` \| `achieved` — real PMF state |
| `PmfReadiness.pmf` | **Internal legacy only** — never show as PMF % in UI |

## Status rules

- **Not Measured** — MVP not released to real users (default during Planner pipeline)
- **Emerging** — MVP released + usage observed (future wiring to release/outcome signals)
- **Achieved** — Validated with retention/revenue data (future CEO Review Gate)

## UI

- Product-market fit row: status + description, no progress bar or misleading %
- PMF Readiness / PMF Status summary cards
- PMF Journey checklist (Opportunity → PMF milestones)
- Planner explanation block at bottom of `PMFJourneyPanel`
- All displayed percentages use `formatReadinessPercent` (integer or one decimal)

## Files

- `lib/pmf/pmfStatus.ts` — types, formatting, aggregate score, status inference
- `lib/pmf/pmfJourney.ts` — rounded scores, `inferCurrentPmfStage` pre-launch focus
- `components/projects/PMFJourneyPanel.tsx` — primary UX
- `types/productai.ts`, `plannerTypes.ts` — mission/run fields for CEO gate compatibility
