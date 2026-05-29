# Phase 8-3 — Repository Coordination Workspace

## Objective

Add a Repository Coordination Workspace so Mission Team members and the CEO can read which repository work is in progress across Mission → Task → Repository → Pull Request → Review → Release—without GitHub execution.

## Scope

### New library modules

- `lib/repository/repositoryWorkspace.ts` — advisory note and view ids
- `lib/repository/repositoryAnalysis.ts` — board, branches, overview, bottlenecks
- `lib/repository/repositoryCoordination.ts` — mission context composition
- `lib/repository/pullRequestContext.ts` — PR context states
- `lib/repository/reviewCoordination.ts` — review aggregation
- `lib/repository/releaseCoordination.ts` — release candidates and blockers
- `lib/repository/repositoryFeed.ts` — feed helpers
- `lib/store/repositoryWorkspaceStore.ts` — `productai-repository-workspace`
- `lib/hooks/useRepositoryWorkspace.ts`

### New UI

- `RepositoryWorkspace` with board, branches, PRs, review, release, summary
- `app/repository-workspace/page.tsx`

### Integrations

- CEO Home Repository Overview card
- COO Workspace → Repository Coordination link
- Delivery Workspace → Repository Context links
- Organization Feed repository event types
- Sidebar navigation

## Pull Request Context States

Not Started, Draft, Ready For Review, Review In Progress, Review Completed, Merged, Closed

## Repository Bottlenecks (Rule-Based)

- Long-term draft PRs
- Review stall (multiple open PRs in review)
- Branch stale (behind main)
- Release candidate stall

## Out of Scope

- GitHub API, PR create/merge, branch create, repository create
- Claude Code / MCP execution

## Next Phase

Phase 8-4 — Release Readiness Workspace (cross-cutting release preparation visibility)
