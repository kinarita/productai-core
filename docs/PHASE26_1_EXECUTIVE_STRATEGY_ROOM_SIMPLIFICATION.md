# Phase 26.1 — Executive Strategy Room Simplification & Decision Flow Redesign

## Goal

Refocus Executive Strategy Room on natural executive conversation—not a management dashboard.

Flow:

```
Conversation → Decision Candidate → CEO Decision → Meeting Minutes → Brief Update → Architect Handoff
```

## UX changes

| Part | Change |
|------|--------|
| A | Removed Explore / Challenge / Decision mode UI. Internal `discussionMode` inferred from CEO message for Planner/COO prompts only. |
| B | Removed per-message **Create Decision**. Candidates auto-created when Planner/COO disagree, new proposals arrive, CEO asks for judgment, etc. |
| C | **Decision Candidate** cards inline below the conversation thread (採用 / 保留 / 却下). |
| D | **Strategy Signals** panel removed from UI; `detectStrategySignals` still runs internally. |
| E | Right sidebar removed; single-column layout restored. |
| F | **Meeting Minutes** via toolbar button + modal (not shown during live discussion). |
| G | Brief path: Suggested Change → Decision Candidate → CEO 採用 → **Apply to Brief** (one action). |
| H | Planner / COO / CEO vote display on each candidate card. |
| I | Meeting Minutes store full vote history per decision. |
| J | **Architect Handoff** via toolbar button + modal (approved Brief, decisions, minutes). |

## Key files

- `lib/discussion/autoDecisionCandidate.ts` — auto-candidate rules and turn-based decisions
- `components/projects/DecisionCandidateCard.tsx` — inline candidates
- `components/projects/DiscoveryDiscussionCard.tsx` — 1-column room
- `components/projects/MeetingMinutesModal.tsx`
- `components/projects/ArchitectHandoffModal.tsx`
- `lib/store/agentRunsStore.ts` — `registerAutoDecisionsFromProposals`, `applyApprovedDecisionToBrief`

## Constraints (unchanged)

- No new AI agents or workflow stages
- Architect Agent, COO Review, CEO Approval gates unchanged
