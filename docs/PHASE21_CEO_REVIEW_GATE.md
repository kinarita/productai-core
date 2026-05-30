# Phase 21 — CEO Review Gate

## Objective

After Product Brief, run an executive review before Architect Agent. Only ideas with sufficient discovery confidence proceed to architecture.

## Workflow

```
Idea → Opportunity → CPF → PSF → Product Brief → CEO Review Gate → Architect Agent
```

## Decision types

| Decision | Meaning |
|----------|---------|
| `PROCEED` | Development value is sufficient — Architect unlocked |
| `VALIDATE MORE` | Return to Planner for additional discovery |
| `HOLD` | Pause project — no architecture or build |

## Initial rule logic

- **PROCEED** — Opportunity ≥ 70 AND CPF ≥ 70 AND PSF ≥ 70
- **HOLD** — Opportunity < 50 OR CPF < 60
- **VALIDATE MORE** — everything else

## Artifacts

- `CEOReviewReport` — overall score, assessments, strengths, concerns, required actions
- `pmfReadinessScore` / `pmfMeasurementStatus` (Phase 21A) remain separate from CEO gate scores

## Integration

- `POST /api/agents/planner/ceo-review` — heuristic CEO reviewer (`ceo_reviewer` agent ID)
- `completePlannerBrief` calls CEO review after brief generation
- `ensureCeoReviewForMission` backfills legacy completed briefs
- Mission fields: `ceoReviewReport`, `projectPipelineStage`
- Architect lock: `isArchitectUnlocked()` — PROCEED only

## UI

- `CeoReviewCard` on Project Hub
- Dashboard pipeline: Planning → CEO Review → Architecture → Build → QA → Release
- Activity feed: CEO review started / completed / decision events

## Files

- `lib/ceo-review/` — types, decision logic, report builder, pipeline stage, architect gate
- `lib/agents/ceo/runCeoReview.ts`
- `components/projects/CeoReviewCard.tsx`
