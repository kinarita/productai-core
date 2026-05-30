# Phase 22 — Discovery Discussion Workspace

## Workflow

```text
Planner → COO Review → Discovery Discussion → CEO Approval → Architect
```

## Participants

| Role | Actor |
|------|--------|
| `ceo` | Human |
| `planner` | Product Planner (AI) |
| `coo` | COO Reviewer (AI) |

## Principles

- Discussion does **not** auto-modify the Product Brief.
- AI may propose `BriefChangeProposal` items with **Apply to Brief** / **Dismiss**.
- Only explicit Apply creates **Brief v2+** (append-only `briefVersions`).
- Architect consumes `latestApprovedBriefVersion` after CEO approval.

## API

`POST /api/discussion/respond`

- Input: `missionId`, `userMessage`, discovery context (brief, opportunity, CPF, PSF, COO report)
- Output: `plannerResponse`, `cooResponse`, `suggestedChanges[]`

## Audit events (append-only)

- `discussion_message`
- `discussion_response`
- `change_proposed`
- `change_applied`
- `brief_version_created`

## Activity feed

- CEO started discussion
- Planner responded / COO responded
- Planner suggested change
- CEO applied change
- Brief updated to vN
