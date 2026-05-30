# Phase 24.5 — Discussion Readability & Conversational UX

## Goal

Shift Discovery Discussion from “AI consultant report” to “AI executive meeting” — short, conversational replies with optional depth, rendered Markdown, and clear Apply feedback.

## Implemented

### Part A — Conversational Response Mode

- Planner and COO default to **2–5 line** replies (summary only in thread).
- `lib/discussion/structuredDiscussionResponse.ts` — JSON `summary` + `detail`.
- `lib/discussion/discussionPersona.ts` — persona prompts enforce 結論 → 理由 → 質問.
- `lib/discussion/runDiscussionRespond.ts` — LLM `completeJson` + heuristic fallback return `plannerSummary` / `plannerDetail` / `cooSummary` / `cooDetail`.

### Part B — Expandable Detail

- `DiscussionMessageBubble` — shows summary by default; **▼ 詳細を見る** expands **Detailed Analysis**.

### Part C — Markdown Rendering

- `react-markdown` via `DiscussionMarkdown` for all agent messages in Discovery Discussion.

### Part D — Persona Refinement

- Planner: **プロダクト責任者** (user value, MVP, validation).
- COO: **事業責任者** (market, revenue, competition, execution risk).
- Long consultant-style answers discouraged in system prompts.

### Part E — Apply Feedback UX

- Removed top-of-card green banner.
- **✅ Brief Updated** block renders **directly under** the applied Suggested Change card (`proposalId` match).

### Part F — Inline Diff Preview

- `InlineBriefDiffPreview` — compact before/after under Apply feedback.

### Part G — Auto Scroll Highlight

- **差分を見る** scrolls to Brief Change Review and applies ~2s ring highlight.

### Part H — Conversation Quality Rules

- Structured responses: conclusion, reason, follow-up question (Markdown **結論:** / **理由:** / **質問:** in heuristic mock).

## API

`POST /api/discussion/respond` returns:

- `plannerSummary`, `plannerDetail`, `cooSummary`, `cooDetail` (plus legacy `plannerResponse` / `cooResponse`).

## Store

- `DiscussionMessage.summary` / `detail` persisted on respond.
- `BriefApplyFeedback.proposalId` + `diff` on Apply.

## Acceptance Scenarios

| Scenario | Expected |
|----------|----------|
| A — CEO asks “グラフ必要？” | Planner & COO ~3–5 lines each |
| B — 詳細を見る | Long analysis expands |
| C — Apply | Brief Updated under proposal card |
| D — 差分を見る | Scroll + highlight on diff section |
| E — Markdown | Rendered, not raw `**` text |

## Key Files

- `components/projects/DiscussionMarkdown.tsx`
- `components/projects/DiscussionMessageBubble.tsx`
- `components/projects/InlineBriefDiffPreview.tsx`
- `components/projects/DiscoveryDiscussionCard.tsx`
- `lib/discussion/runDiscussionHeuristic.ts`
- `lib/store/agentRunsStore.ts`
