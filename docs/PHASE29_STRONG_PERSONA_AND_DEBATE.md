# Phase 29 — Strong Persona & Executive Debate

## Goal

Product Planner vs COO as distinct executives who genuinely debate — not duplicate AI voices.

## Implemented

### Part A — Strong persona profiles
- `lib/discussion/executivePersonaProfiles.ts` — roles, missions, catchphrases, thinking tendencies

### Part B — Persona consistency
- `personaSelfCheckPlanner` / `personaSelfCheckCoo` — strip role bleed; reduce repeated Brief disclaimers
- Prompt injection via `personaSelfCheckPrompt` + profile blocks in `discussionPersona.ts`

### Part C — Debate mode
- `lib/discussion/executiveDebate.ts` — `isExecutiveDebate`
- `DiscussionMessage.executiveDebate` + inline **⚔ Debate** banner (no layout change)

### Part D — Strong voting
- `inferStrongExecutiveVotes` — default away from Neutral
- Planner: Approve / Hold only · COO: Approve / Hold / Reject

### Part E–F — Decision quality & CEO visibility
- `inferDecisionVotesWithReasons` + `executiveCommentForVote`
- Decision Candidate card: **状態: 議論中**

### Part G — Meeting Minutes
- `decisionJourney` with `plannerComment`, `cooComment`, `decision` fields

## Unchanged
UI layout, Brief Versioning, Apply to Brief, Activity Stream, Directed Discussion selector.

## Acceptance (mock heuristic)
- ライブ動画OCRを入れたい → Planner Approve tone / COO Hold
- MVPにグラフは必要？ → debate
- Candidate shows votes; Minutes record journey
