# Phase 23 — Strategic Discussion Agents

## Goal

Replace template Discovery Discussion replies with context-aware strategic dialogue from Product Planner and COO.

## Context engine

`buildDiscussionContext()` (`lib/discussion/buildDiscussionContext.ts`) loads:

- Mission / CEO inputs
- Opportunity Brief, CPF, PSF, Product Brief
- COO Review
- CEO validation history
- **Full** discussion thread (not only the latest turn)

## Personas

- **Planner** — user value, MVP scope, validation, design tradeoffs (`discussionPersona.ts`)
- **COO** — market, competition, revenue, execution risk

## Response pipeline

1. Build context
2. Planner LLM response (references artifacts + history)
3. COO LLM response (sees Planner answer for contrast)
4. JSON proposal generation from the turn (v2: reason, impact, affectedSections)

Providers: OpenAI / Anthropic via `DISCUSSION_PROVIDER` or `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`.  
Without keys: `runDiscussionHeuristic()` — still product-specific, not generic templates.

## Quality rules

Banned generic consulting phrases; answers must cite product name and Brief/CPF/PSF/MVP content.

## Suggested Change v2

| Field | Purpose |
|-------|---------|
| title | Short label |
| reason | Why discussion warrants change |
| impact | Expected improvement |
| affectedSections | opportunity, cpf, psf, brief, mvp |
| before / after | Diff preview |
| confidence | 0–100 |

## Activity labels

- Planner responded to discussion
- COO responded to discussion
- Suggested change proposed
- Suggested change applied
