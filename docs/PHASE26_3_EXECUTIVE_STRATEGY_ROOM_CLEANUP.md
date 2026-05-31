# Phase 26.3 — Executive Strategy Room Cleanup & UX Polish

No new features — experience quality only.

## P1 — Product Planner naming

Organization model: CEO, COO, Product Planner, Architect, Builder, QA.

`Head of Product` removed from UI, activity, discussion prompts, meeting minutes labels.

Central labels: `lib/discussion/executiveRoomLabels.ts`

## P2 — Meeting Minutes view-only

- Removed 議事録を確定 / Finalize
- Open modal → auto-generate latest
- Refresh Minutes for manual refresh

## P3 — Pending banner placement

Layout:

```
Conversation → Input → Pending banner → Decision Candidates → Brief Updated → Review
```

Japanese: `⚠ まだ N 件の判断待ちがあります。採用・保留・却下を選択してください。`

## P4 — Architect Handoff gate copy

When pending > 0: **Architecture handoff blocked.** + count + preview-only handoff.

`handoffReady` unchanged from Phase 26.2 logic.
