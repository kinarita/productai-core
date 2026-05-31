# Phase 29.6 — Resolved Debate Cleanup

## Goal

CEO が Decision Candidate を採用・保留・却下したあと、関連 Debate を会話上の「未解決論点」として目立たせ続けない。

## Behavior

1. **Resolve on CEO decision** — `approved` / `rejected` / `on_hold`（および `applied_to_brief`）で、同一 topic の Debate メッセージに `debateResolved` を付与。
2. **UI — resolved** — 大きな ⚔ Debate ブロックは非表示。代わりに小さく `Resolved: Rejected by CEO` 等。
3. **UI — pending** — 未判断の Debate のみ従来どおり Topic / 理由 / Why Debate を表示。
4. **Meeting Minutes** — Decision Journey は変更なし（履歴として残る）。
5. **Re-proposal** — 同じ話題を CEO が再度提起した新しいターンは、新規 Debate として pending 表示（旧 Debate は resolved のまま）。
6. **Linking** — 新規 Candidate 生成時に `debateDecisionId` を debate メッセージへ紐付け。

## Key files

- `lib/discussion/resolveExecutiveDebate.ts` — topic match, resolve, display state
- `lib/discussion/discussionTypes.ts` — `debateResolved`, `debateResolutionStatus`, `debateDecisionId`
- `lib/store/agentRunsStore.ts` — `setCeoDecisionOnItem`, debate linking on new candidates
- `components/projects/DiscussionMessageBubble.tsx` — pending vs resolved rendering
- `components/projects/DiscoveryDiscussionCard.tsx` — passes `decisionItems`

## Acceptance

| Case | Expected |
|------|----------|
| CEO rejects candidate | Debate collapses to `Resolved: Rejected by CEO` |
| CEO approves / on hold | Matching resolved label |
| Meeting Minutes | Decision Journey unchanged |
| Same topic re-proposed | New turn shows full Debate; old stays resolved |
