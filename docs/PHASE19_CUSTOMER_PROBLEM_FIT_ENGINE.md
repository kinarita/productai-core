# Phase 19 — Customer Problem Fit (CPF) Engine

## Goal

After Opportunity Discovery, Product Planner evaluates **Customer Problem Fit**: who the customer is, what jobs they need done, how severe the pain is, and whether to proceed before Product Brief / Architect handoff.

## Flow

```
Idea → Discovery → Opportunity → Customer Problem Fit → PSF → MVP → Planning → Review
```

## CustomerProblemFitReport

| Field | Description |
|-------|-------------|
| `persona` | Specific customer segments (not vague labels) |
| `customerJobs` | Jobs to be done |
| `painPoints` | Ranked pains with `severity` (low → critical) |
| `currentAlternatives` | How users solve today |
| `alternativeWeaknesses` | Why alternatives fail |
| `burningNeedScore` | 0–100 urgency |
| `cpfScore` | 0–100 CPF estimate |
| `evidenceLevel` | low / medium / high |
| `recommendation` | proceed / validate_more / hold |

Generated via `POST /api/agents/planner/cpf` after Opportunity Brief (heuristic; no interviews API).

## Planner behavior

- **Guided**: CPF clarification questions (who suffers most, current workaround, dissatisfaction, willingness to pay)
- **Quick**: Assumption-first; max 3 questions total (existing caps)

## Discovery insights

Added to assessment and UI:

- `painPoints`
- `burningNeeds`

(alongside strengths, gaps, opportunities, threats)

## Audit

- `cpfScore`, `burningNeedScore`, `topPain`, `personaSummary`, `recommendation`

## Activity feed

- Planner identified customer persona
- Planner identified customer pain points
- Planner evaluated burning need
- Planner completed CPF analysis

## UI

`CustomerProblemFitCard` on project hub (below Opportunity Brief).

## Out of scope

PSF, MVP design, Architect, CEO Review.

## Key files

- `lib/cpf/cpfTypes.ts`
- `lib/cpf/buildCustomerProblemFitReport.ts`
- `lib/agents/planner/runPlannerCpf.ts`
- `app/api/agents/planner/cpf/route.ts`
- `components/projects/CustomerProblemFitCard.tsx`
