# Phase 29.5 — Persona Voice & Debate Clarity

## Goal

Executive Strategy Room の Product Planner / COO を「役割ラベル」から「信念を持つ役員」へ進化させ、Debate の理由を CEO が一目で理解できるようにする。

## Part A — Executive Belief System

- `lib/discussion/executiveBeliefs.ts` — Mission / Core Beliefs / `beliefCheckPrompt` / `beliefCommentForVote`
- Planner: PMF 最優先、体験重視、価値あるなら前向き
- COO: 実行可能性、MVP 肥大化回避、データがないなら保留

## Part B — Belief-Aware Reasoning

- `personaSelfCheckPlanner` / `personaSelfCheckCoo` — 返信前に信念チェック + テンプレ禁止
- `beliefCheckPrompt` を Planner/COO プロンプトに組み込み（`discussionPersona.ts`）

## Part C — Voice Style

- 禁止テンプレ: Planner「ユーザー体験を向上する可能性があります」、COO「コストとリスクがあります」
- 信念ベースの短い段落（面白いですね → 具体体験 → 私は… / 価値は理解できます → ただ MVP としては…）

## Part D — Debate Clarity (UI)

`DiscussionMessageBubble` — Debate 時に表示:

- Topic
- Planner: 👍/⚠ + 理由
- COO: 👍/⚠ + 理由
- Why Debate?

## Part E — Debate Summary

- `buildDebateSummary` — COO メッセージの detail に Debate Summary を付与
- `buildExecutiveDebateContext` — 全 debate フィールドをメッセージへ

## Part F — Stronger Candidate Opinions

- `beliefCommentForVote` / `inferDecisionVotesWithReasons` — 音声入力・OCR 等の信念ベース rationale
- `DecisionCandidateCard` — 既存 VoteRow で 👍/⚠ + 理由表示

## Part G — Template Guard

- `lib/discussion/templatePhraseGuard.ts` — 同一会話内の禁止フレーズ連続使用を回避
- `recordTemplateUsage` — `discussionPersonaMemory.usedPlannerTemplates` / `usedCooTemplates`

## Part H — Meeting Minutes

- `buildBeliefConflicts` — Belief Conflict セクション
- `MeetingMinutesModal` — Topic / Planner Belief / COO Belief / CEO Decision
- `appendBeliefConflictToMemory` — debate 発生時に memory へ記録

## Acceptance Scenarios

| Scenario | Expected |
|----------|----------|
| A — CEO「音声入力を入れたい」 | Planner=価値、COO=実行性（heuristic + belief comments） |
| B — Debate | Topic / 各理由 / Why Debate 表示 |
| C — Template guard | 同じテンプレ文を連発しない |
| D — Meeting Minutes | Belief Conflict 記録 |

## Constraints (unchanged)

- UI レイアウト大規模変更なし
- Product Planner / COO のみ
- Decision Candidate フロー・Brief Versioning 変更なし

## Key files

- `lib/discussion/executiveBeliefs.ts`
- `lib/discussion/executiveDebate.ts`
- `lib/discussion/templatePhraseGuard.ts`
- `lib/discussion/buildBeliefConflicts.ts`
- `lib/discussion/executivePersonaProfiles.ts`
- `lib/store/agentRunsStore.ts`
- `components/projects/DiscussionMessageBubble.tsx`
- `components/projects/MeetingMinutesModal.tsx`
