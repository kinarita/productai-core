# Phase 20 — Problem Solution Fit (PSF) Engine

## Goal

After Customer Problem Fit, Product Planner evaluates whether the **proposed solution** fits the validated problem—solution hypothesis, MVP scope, validation plan, and PSF score—before Product Brief and Architect handoff.

## Flow

```
Idea → Discovery → Opportunity → CPF → PSF → MVP → Planning → Review
```

## ProblemSolutionFitReport

| Field | Description |
|-------|-------------|
| `topProblem` | Highest-priority customer pain |
| `solutionHypothesis` | How the product solves it |
| `expectedOutcome` | Measurable change users should see |
| `validationAssumptions` | What must be true for success |
| `validationRisks` | What could invalidate the solution |
| `validationPlan` | Lightweight validation steps |
| `mvpFeatures` | Must / Should / Could / Won't Have |
| `psfScore` | 0–100 |
| `confidenceLevel` | low / medium / high |
| `recommendation` | proceed / validate_more / hold |

Generated via `POST /api/agents/planner/psf` after CPF (heuristic; no code generation).

## Planner behavior

- **Guided**: PSF questions (why this feature, alternatives, minimum MVP, first users)
- **Quick**: Existing 3-question cap + assumptions

## Discovery insights

Added: `validationAssumptions`, `validationRisks`, `mvpScope`

## Audit

- `psfScore`, `solutionHypothesis`, `validationRisks`, `validationAssumptions`, `mvpFeatures`, `recommendation`

## Activity feed

- Planner generated solution hypothesis
- Planner identified validation risks
- Planner proposed MVP scope
- Planner completed PSF analysis

## UI

- `ProblemSolutionFitCard` — Top Problem, Solution, PSF Score, Recommendation
- **MVP Scope** panel — Must / Should / Could / Won't Have

## Out of scope

CEO Review Gate, Architect, repository, code generation, deployment.

## Key files

- `lib/psf/psfTypes.ts`
- `lib/psf/buildProblemSolutionFitReport.ts`
- `lib/agents/planner/runPlannerPsf.ts`
- `app/api/agents/planner/psf/route.ts`
- `components/projects/ProblemSolutionFitCard.tsx`
