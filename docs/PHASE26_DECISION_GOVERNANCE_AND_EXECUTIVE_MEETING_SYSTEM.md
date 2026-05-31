# Phase 26 — Decision Governance & Executive Meeting System

## Goal

Separate **discussion**, **decision**, and **Brief update** into a governed pipeline so organizational knowledge is preserved before architecture.

```text
Discussion → Proposed Change → Decision → Meeting Minutes → Brief Update → Architect Handoff
```

## Implemented

### Part A — Decision Layer

- `DecisionItem` with `DecisionStatus`: pending, approved, rejected, needs_discussion
- Planner / COO votes: approve | reject | neutral
- CEO decision on each item

### Part B — Suggested Change → Decision Candidate

- New proposals auto-register as `DecisionItem` with inferred votes
- Proposal status: `awaiting_decision` (not directly applicable to Brief)

### Part C — CEO Decision Board

- Right sidebar: **Decisions Awaiting CEO** with Approve / Reject / Need Discussion
- Approved items: **Create Brief Change Candidate**

### Part D — Meeting Minutes

- Replaces Strategy Summary UI
- Sections: Discussion Topics, Decisions Made, Rejected Ideas, Open Questions, Brief Changes, Architect Notes

### Part E — Create Decision

- Removed Agreed / Open Question / Rejected on CEO messages
- **Create Decision** button on CEO turns

### Part F — Brief Update Governance

- **Create Brief Change Candidate** (after decision approved)
- **Commit to Brief** (only from approved candidate — no immediate Apply on proposal)

### Part G — Architect Handoff Package

- Approved / rejected decisions, open questions, meeting minutes, latest Brief excerpt, committed changes

### Part H — Timeline

- Pipeline stage `executive_decision` between COO Review and CEO Approval
- Labels: Discussion → Decision → Approval → Architecture

### Part I — Activity

- Decision proposed / approved / rejected, brief change candidate, meeting minutes generated

### Part J — Audit

- `decision_created`, `decision_approved`, `decision_rejected`, `decision_needs_discussion`
- `brief_change_candidate_created`, `brief_change_committed`
- `meeting_minutes_generated`, `architect_handoff_created`

## Constraints

- Architect Agent logic unchanged
- COO Review and CEO Approval gate logic unchanged
- Opportunity / CPF / PSF engines unchanged

## Key files

- `lib/discussion/decisionGovernanceTypes.ts`
- `lib/discussion/createDecisionFromProposal.ts`
- `lib/discussion/generateMeetingMinutes.ts`
- `lib/store/agentRunsStore.ts`
- `components/projects/CeoDecisionBoard.tsx`
- `components/projects/MeetingMinutesPanel.tsx`
- `components/projects/BriefChangeCandidatesPanel.tsx`
