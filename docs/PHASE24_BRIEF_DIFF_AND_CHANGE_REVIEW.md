# Phase 24 — Brief Diff & Change Review Experience

## Problem

After **Apply to Brief**, CEOs could not see what changed, why, or where it was reflected — causing confusion about approval vs. re-validation.

## Solution

Evolve version management into **Change Review**:

| Layer | Module |
|-------|--------|
| Diff engine | `lib/brief-diff/computeBriefDiff.ts` |
| CEO summary | `lib/brief-diff/buildChangeSummary.ts` |
| Approval preview | `lib/brief-diff/getChangesSinceLastReview.ts` |
| UI | `BriefDiffViewer`, enhanced `BriefHistoryPanel` |

## Brief sections diffed

Project Summary, Problem Statement, Target Users, Success Metrics, Core Features, MVP Scope, Out of Scope, Risks, Recommended Next Step.

## Apply feedback (Phase 24-D)

Green banner after Apply:

- Brief Updated / Version N created
- Summary (+ Added / ~ Modified)
- **View Changes** scrolls to diff viewer

## Version timeline (Phase 24-E)

Labels like:

- `v1 Initial Brief`
- `v2 Added Graph Features (from discussion)`

## Audit (Phase 24-H)

Each apply records:

- `versionId`, `previousVersionId`
- `changeSummary`, `reason`, `impact`
- `sourceDiscussionId` (proposal id)
- `appliedBy: ceo`, `timestamp`
- Full `diff` payload

Events: `brief_version_created`, `brief_diff_generated`, `change_applied_with_review`.

## CEO Decision (Phase 24-G)

**Latest Changes Since Last Review** — cumulative diff from last approved version (or v1) to current Brief before Approve.
