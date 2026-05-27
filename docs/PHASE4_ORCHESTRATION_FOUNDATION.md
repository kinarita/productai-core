# ProductAI Phase 4 Orchestration Foundation

## Purpose

Phase 4-1 introduces the first orchestration seed for ProductAI:

- role-based AI organizational thinking,
- deterministic operational recommendation flow,
- provider abstraction for future LLM integration.

This phase is intentionally non-autonomous:

- no background workers,
- no automatic task execution,
- no code generation/deployment loops,
- no multi-agent realtime runtime.

## Architecture

### Orchestration layer

`lib/orchestration/` introduces:

- `orchestrationTypes.ts` — role and response contracts
- `agentRegistry.ts` — AI role registry
- `contextBuilder.ts` — structured context assembly from stores
- `orchestrationContext.ts` — compact context helpers
- `orchestrator.ts` — `ProductAIOrchestrator` interface + mock implementation
- `prompts/*` — prompt template foundation for future provider wiring

### AI provider abstraction

`lib/ai/` introduces:

- `providerTypes.ts` — provider interface (`generateText`, `summarize`, `analyze`)
- `mockProvider.ts` — deterministic operational mock output
- `aiProvider.ts` — provider resolver

The abstraction is future-ready for OpenAI / Claude integration, but currently mock-backed.

## Agent model

Phase 4-1 role set:

- CEO
- COO
- Architect
- Engineer
- QA
- Runtime Observer

Each role includes:

- id
- displayName
- responsibility
- operationalTone

## UI integration (seed)

- Executive Sync:
  - Generate AI Discussion
  - Generate Operational Summary
- Judgment Center:
  - AI Recommendation panel (recommended option, rationale, execution risk, dependency concerns)
- Organization Feed:
  - Generate AI Event
- Runtime & Cost:
  - Runtime Observer Insight

## Tone policy

All generated messages follow ProductAI operational tone:

- calm
- executive
- concise
- mission-linked

Not chatbot-like, not hype-oriented, not noisy alert theater.

## Persistence scope

Phase 4-1 does not add DB persistence for orchestration artifacts.

- orchestration outputs are view/state level
- optional feed events can be appended via existing feed write flow

## Next direction (post Phase 4-1)

1. Connect provider abstraction to configurable external models.
2. Add mission-scoped orchestration sessions.
3. Introduce guarded execution plans (human-approved).
4. Add policy checks before any autonomous execution step.
