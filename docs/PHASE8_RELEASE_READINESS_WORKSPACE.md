# Phase 8-4 — Release Readiness Workspace

## Objective

Provide a dedicated Release Readiness Workspace so the CEO can read Mission → Task → Repository → Review → Release readiness on one surface—visualization only, no deploy or release execution.

## Scope

### Library

- `releaseWorkspace.ts` — readiness levels and view ids
- `releaseReadiness.ts` — mission readiness rows and mission context
- `releaseChecklist.ts` — seven checklist items (complete / partial / missing)
- `releaseRisks.ts` — rule-based risk detection
- `releaseSummary.ts` — overview and mission board
- `releaseFeed.ts` — feed helpers
- `releaseWorkspaceStore.ts` — `productai-release-workspace`

### UI

- `/release-workspace` — board, checklist, risks, summary, cross-workspace links
- CEO Home Release Readiness Overview
- COO Release Context links (Delivery → Repository → Release)
- Mission Detail Release Readiness Context
- Repository Workspace Release Readiness Summary

## Readiness Levels

Not Ready · Preparing · Candidate · Ready For Release · Released

## Checklist Items

Architecture Review, Design Review, Development Complete, QA Complete, Documentation Complete, Repository Ready, Review Complete

## Out of Scope

GitHub API, deploy, release execution, CI/CD, MCP, automatic release

## Next Phase

Phase 8-5 — Code & Release Workspace (Outcome visibility, still no execution)
