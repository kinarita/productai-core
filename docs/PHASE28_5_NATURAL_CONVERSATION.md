# Phase 28.5 — Natural Conversation & Candidate Escalation

## Goal

Executive Strategy Room を「レポート生成器」から「人格を持った経営会議」へ。

## Implemented

### Part A — `DiscussionIntent`

`lib/discussion/discussionIntent.ts` — `greeting` | `smalltalk` | `clarification` | `challenge` | `brainstorm` | `proposal` | `decision`

### Part B — Natural responses

- `lib/discussion/intentResponseGuide.ts` — intent別トーン（質問は必須ではない）
- `discussionPersona.ts` — 結論/理由/質問ラベル廃止、`discussionSignal` / `suggestsDecisionCandidate` JSON フラグ

### Part C — Persona memory

- `lib/discussion/personaMemory.ts` — CEO仮説・懸念・価値観・未解決/採用論点
- `PlannerRunMeta.discussionPersonaMemory` — ターンごとに更新・プロンプト注入

### Part D — Persona divergence

- Planner: UX / 価値 / PMF — COO: コスト / 運用 / リスク（同一フレーズ禁止）

### Part E — Two-stage escalation

| Stage | UI | Candidate |
|-------|-----|-----------|
| 1 | ⚠ Discussion may lead to a product decision | 作らない |
| 2 | ⚠ Decision Candidate Suggested | 作る |

Stage 2 条件: `decision` intent、CEO「採用/検討したい」、Planner+COO 両方の判断フラグ、または両エージェントが「判断が必要」

### Part F — Candidate quality

- `AgentVote` に `hold` 追加
- `inferDecisionVotesWithReasons` — 投票と理由を自動付与

### Part G — Meeting Minutes

- `MeetingMinutesDecisionJourneyEntry.topic` + 議論フロー行

## Acceptance (mock)

| Scenario | CEO | Expected |
|----------|-----|----------|
| A | おはよう | 自然な挨拶、POS等に触れない |
| B | ライブカメラどう？ | Planner=価値、COO=コスト、文言が異なる |
| C | それ面白いね | Stage 1 signal のみ |
| D | 採用したい | Decision Candidate |
| E | Minutes | Decision Journey |

## Phase 28.5.1 Hotfix (decision intent escalation)

- `lib/discussion/decisionDirective.ts` — CEO 明示依頼（入れてください / add to brief 等）を `decision` に分類
- `lib/discussion/discussionTopic.ts` — 省略 CEO 発言から直近トピックで Candidate タイトル生成
- Stage 2 UI / Candidate: `classifyDiscussionIntent === "decision"` で Discussion Signal に止めない
- `isCeoBrainstormPhrase` — 「〜どう？」「面白いね」は Stage 1 のみ

## Unchanged

Brief Versioning, Apply to Brief, CEO Approval, Architect Handoff, Activity Stream
