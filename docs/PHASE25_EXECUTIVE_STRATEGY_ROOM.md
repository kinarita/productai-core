# Phase 25 — Executive Strategy Room

## Goal

Transform Discovery Discussion from Q&A into a multi-turn **Executive Strategy Room** where CEO, Product Planner, and COO collaboratively refine strategy before architecture.

## Implemented

### Part A — Multi-turn conversation memory

- `buildDiscussionContext` includes brief version history, applied changes, executive decision log, and full thread.
- API and store pass `briefVersions`, `pendingProposals`, `executiveDecisions`, `discussionMode`.

### Part B — Conversational personas

- Product Planner: user value, MVP, validation, experiments; may challenge assumptions.
- COO: market, revenue, competition, execution; may disagree with Planner.
- Heuristic mock enforces disagreement in **Challenge** mode (e.g. graphs in MVP).

### Part C — Discussion modes

- **Explore** / **Challenge** / **Decision** selector in UI; persisted as `discussionMode`.
- Mode instructions injected into Planner and COO prompts.

### Part D — Strategy signals

- `detectStrategySignals` — scope risk, user insight, business risk, new opportunity.
- **Strategy Signals** sidebar panel.

### Part E — Executive decisions

- CEO messages: **Agreed** / **Open Question** / **Rejected** buttons.
- Auto-inference on messages like “I agree” / “同意”.

### Part F — Decision register

- **Executive Decision Log** with numbered decisions and status.

### Part G — Strategy summary

- `generateStrategySummary` after ≥2 CEO turns.
- Sections: What We Learned, What Changed, Open Questions, Recommended Next Step.
- **Apply to Brief** (updates `recommendedNextStep`) or **Keep as Discussion**.

### Part H — Architect handoff preview

- `buildArchitectHandoffPreview` — latest Brief excerpt, decisions, open questions, applied changes.
- **Architect Will Receive** collapsible panel.

### Part I — Activity

- Executive discussion started, Planner challenged assumption, COO raised business concern, Executive decision recorded, Strategy summary generated.

### Part J — Audit

- `buildStrategyRoomAuditRecord` — append-only events with `discussionMode`, `executiveDecisions`, `strategySignals`, `strategySummary`, `architectHandoffPreview`.

## Constraints respected

- No Architect Agent implementation.
- No changes to Opportunity / CPF / PSF engines.
- No changes to COO Review or CEO Approval gate logic.

## Key files

- `lib/discussion/strategyRoomTypes.ts`
- `lib/discussion/buildDiscussionContext.ts`
- `lib/discussion/discussionPersona.ts`
- `lib/store/agentRunsStore.ts`
- `components/projects/DiscoveryDiscussionCard.tsx` (title: Executive Strategy Room)

## Acceptance scenarios

| Scenario | Expected |
|----------|----------|
| A — Graphs in MVP? | Planner supports; COO raises complexity (both visible) |
| B — “I agree” | Decision log entry |
| C — Broad target users | Scope Risk signal |
| D — Several turns | Strategy summary available |
| E — Architect Will Receive | Full handoff package |
