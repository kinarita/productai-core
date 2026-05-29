# Phase 11 — Agent-First UI Simplification

Version: 1.0  
Date: 2026-05-30  
Status: Phase 1 implemented

---

## Objective

Evolve ProductAI from an **organization-centric** UI to an **agent-first** product:

- Users see **Projects, Tasks, AI Team, Reviews, Releases, Memory**
- Internal workspaces (Director, Architect, COO, etc.) remain **reachable by URL** but are **hidden from Phase 1 navigation**
- **Explainability First:** every AI worker exposes Input, work summary, Output, and **Why** reasons
- **Artifact Lineage** stays as a differentiator under **Advanced**

---

## Phase 1 Navigation

| Label | Route | Notes |
|-------|-------|-------|
| Projects | `/` | Project Dashboard (home) |
| Tasks | `/tasks` | Existing task list |
| AI Team | `/ai-team` | Worker status + explainability panels |
| Reviews | `/review-workspace` | Renamed in UI only |
| Releases | `/releases` | Hub → readiness + outcome workspaces |
| Memory | `/memory` | Existing memory vault |

### Advanced (sidebar section)

| Label | Route |
|-------|-------|
| Artifact Lineage | `/artifact-lineage` |

### Hidden from sidebar (still available)

CEO Home, CEO Command Center, role workspaces (Idea, Brief, Director, Architect, Designer, Developer, QA, COO), Delivery, Repository, Lifecycle, Executive Sync, Judgment, Missions list, Organization Feed, Runtime & Cost, Settings, Team Handoff, Artifact Review, etc.

Direct URLs unchanged—for power users and existing integrations.

---

## New surfaces

### Project Dashboard (`/`)

- Featured active project: name, stage, completion %, stage progress bar (Planning → Release)
- AI worker summary, latest review, latest artifact
- CTA: 「新しいプロジェクトを始める」→ `/idea-workspace`
- All active projects list

**Lib:** `lib/agent-first/workerAnalysis.ts`, `lib/agent-first/aiWorkers.ts`

### AI Team View (`/ai-team`)

- Per-mission worker list: Product Planner, Architect, Designer, Developer, QA
- Status: 完了 / 作業中 / 待機中 / 未着手
- Expandable panel: 実施内容, 入力, 出力, **Why**
- Link to legacy workspace for advanced editing

### Releases Hub (`/releases`)

- Cards linking to `/release-workspace` and `/code-release-workspace`

---

## AI Worker priorities (implementation prep)

| Priority | Worker | Input | Output |
|----------|--------|-------|--------|
| 1 | Product Planner | User request | Product Brief |
| 2 | Architect | Product Brief | Technical Specification |
| 3 | Designer | Technical Specification | Design Specification |
| 4 | Developer | Design Specification | Implementation Plan |
| 5 | QA | Implementation Plan | QA Plan |

**Agent execution rule (documented):** store Input, Reasoning Summary (Why), Output—no black box. Phase 1 UI surfaces Why from mission/handoff context; dedicated persistence per run is a follow-up.

---

## UX principles

- Understandable without org-chart literacy
- Start from 「何を作りたいですか？」
- Phase 1 success: new user can assign work and see deliverables within **5 minutes** (manual QA target)

---

## Files added / changed

| Path | Change |
|------|--------|
| `lib/agent-first/*` | Workers, dashboard analysis, nav config |
| `components/projects/ProjectDashboardView.tsx` | Home dashboard |
| `components/ai-team/*` | AI Team UI |
| `components/releases/ReleasesHubView.tsx` | Releases hub |
| `app/page.tsx` | Home → Project Dashboard |
| `app/ai-team/page.tsx` | AI Team route |
| `app/releases/page.tsx` | Releases hub route |
| `components/Sidebar.tsx` | Phase 1 nav + Advanced |
| `components/cross-review/CrossReviewWorkspaceView.tsx` | Title → Reviews |

---

## Build / Lint

- `npm run build` — success
- `npm run lint` — success

---

## Next steps (not in Phase 1)

1. Persist per-worker `Input / Reasoning / Output` records in store
2. Implement Priority 1 Product Planner agent run (human-triggered only)
3. Sidebar search / command palette for hidden workspaces
4. Merge Artifact Review into Reviews hub (tabbed)
5. Redirect `/ceo-home` → `/` for bookmarks

---

## References

- `docs/PHASE10_MVP_REVIEW.md`
- `docs/10_MVP_SCOPE.md`
