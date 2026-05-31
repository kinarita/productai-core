# Phase 26.2 — Decision Candidate Flow Finalization

## Goal

Conversation-first Executive Strategy Room where the CEO resolves decisions naturally; only finalized content reaches Brief and meeting minutes.

## UX layout

```
Conversation
↓
Input Form
↓
判断が必要な論点 (pending only)
↓
Brief Updated
↓
Brief Change Review
```

## Decision lifecycle

| Status | Behavior |
|--------|----------|
| `pending` | Shown in UI; listed in Meeting Minutes Pending Decisions |
| `approved` | CEO 採用; if linked proposal → auto Brief vNext → `applied_to_brief` |
| `rejected` | Not applied to Brief |
| `on_hold` | Open Questions in minutes; removed from active UI |
| `applied_to_brief` | Brief committed; hidden from candidate list |

## Gates

- **Architect Handoff**: `handoffReady` only when `pending` count is 0; otherwise preview + audit `architect_handoff_blocked_pending_decisions`
- **Architect unlock**: `executiveDecision === approved` AND no pending candidates
- **CEO Decision card**: warning banner when pending remain; Approve & Continue disabled until resolved

## Meeting Minutes

- Generated automatically when modal opens (`meeting_minutes_opened` audit)
- Optional **Refresh Minutes** for regeneration
- Always includes `pendingDecisions` section

## Key files

- `lib/discussion/decisionCandidateStatus.ts`
- `lib/store/agentRunsStore.ts` — `setCeoDecisionOnItem` auto-apply path
- `components/projects/DiscoveryDiscussionCard.tsx`
- `lib/coo-review/architectGate.ts`
