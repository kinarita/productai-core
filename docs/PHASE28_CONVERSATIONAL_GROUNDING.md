# Phase 28 — Conversational Grounding & Decision Candidate Discipline

## Goal

Executive Strategy Room を「レポート生成UI」から「本当に相談できる経営会議」へ進化させる。

## Implemented

### Part A — Grounded Conversation Mode

- `lib/discussion/groundingRules.ts` — Brief vs CEO仮説の分離ルール
- `lib/discussion/buildDiscussionContext.ts` — Fixed context ブロック（Mission, Opportunity, CPF, PSF, Brief latest, Approved/Pending decisions, Applied changes, CEO history）

### Part B — Conversational Response Style

- `lib/discussion/conversationalResponseStyle.ts` — `small_question` | `discussion` | `deep_discussion`
- `lib/discussion/discussionPersona.ts` — 毎回 結論/理由/質問 を強制しない JSON プロンプト

### Part C–D — Candidate Discipline & Confidence

- `lib/discussion/decisionCandidateDiscipline.ts`
  - `classifyCeoIntent` — 用語説明・雑談・仮説壁打ち等は Candidate 対象外
  - `computeCandidateConfidence` — 0–100、**70 未満は生成しない**
  - `shouldAutoCreateDecisionCandidate` — 厳格化（`autoDecisionCandidate.ts` から利用）

### Part E — Escalation Pattern

- `agentsSuggestEscalation` — Planner/COO が判断必要と示したとき
- `DiscussionMessage.suggestsDecisionCandidate` + `DiscussionMessageBubble` — ⚠ Decision Candidate Suggested

### Part F — Meeting Minutes Quality

- `lib/discussion/buildDecisionJourney.ts`
- `MeetingMinutes.decisionJourney` + `MeetingMinutesModal` — Decision Journey セクション

## Acceptance scenarios (mock heuristic)

| Scenario | CEO message | Expected |
|----------|-------------|----------|
| A | それって何？ | No candidate |
| B | POS連携したら？ | Grounded as 仮説, no candidate |
| C | MVPにグラフを入れる | Planner/Coo split → candidate (confidence ≥ 70) |
| D | Meeting Minutes | `decisionJourney` populated |

## Unchanged (per spec)

CEO Approval, Architect Handoff, Brief Versioning, Apply to Brief gates.
