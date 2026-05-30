# Phase 12 — Human-First Simplification

Version: 1.0  
Date: 2026-05-30  
Status: Implemented (presentation layer only)

---

## Objective

Replace enterprise terminology with language a non-technical user can understand in **60 seconds**, without changing underlying data structures, stores, or routes.

---

## Changes by area

### 1. Knowledge (was Memory Vault)

| Before | After |
|--------|-------|
| Memory Vault | Team Knowledge |
| Organizational Learning | Lessons Learned |
| Architecture Wisdom | Design Patterns |
| Incident Lesson | Problems We Solved |
| Successful Pattern | Best Practices |

Route: `/memory` · Nav label: **Knowledge**

### 2. Decision Trail (was Artifact Lineage)

| Before | After |
|--------|-------|
| Artifact Lineage | Decision Trail |
| Artifact | Deliverable |
| Lineage / Artifact Chain | History |
| Review Trace | Review History |
| Ownership | Responsible AI Worker |

Route: `/artifact-lineage` (unchanged) · Advanced nav only

### 3. Reviews

- `/review-workspace` now shows **status cards** only (🟢 Approved, 🟡 Waiting Review, 🔴 Changes Requested)
- Each card: title, reviewer, status, last updated, project
- Enterprise matrix/board hidden from default page (legacy components remain in repo)
- Not in main sidebar; linked from Projects dashboard

### 4. Releases

- `/releases` shows **project release cards** with Live / Preparing / Staging / Not Released
- Release date + outcome summary per project
- Links to existing readiness/outcome workspaces for detail

### 5. Tasks

- Title: **Tasks** (not Tasks & Execution)
- Role labels: Engineer → Builder, COO → Coordinator
- `AgentAvatar` + human status on each card
- Kanban columns: In progress, Needs review, Blocked, Done

### 6. Navigation (final)

**Main:** Projects · Tasks · AI Team · Knowledge · Releases  

**Advanced:** Decision Trail  

Hidden from sidebar: CEO Home, Command Center, role workspaces, Reviews (route kept), COO, etc.

---

## New / updated modules

| Path | Role |
|------|------|
| `lib/human-first/terminology.ts` | Central display labels |
| `lib/human-first/reviewCards.ts` | Human review card model |
| `lib/human-first/releaseCards.ts` | Human release card model |
| `components/reviews/HumanReviewsView.tsx` | Reviews UI |
| `components/releases/ReleasesHubView.tsx` | Release cards UI |
| `lib/agent-first/agentFirstNav.ts` | Phase 12 nav config |

---

## Success criteria (manual QA)

Within 60 seconds, a new user should articulate from the UI:

1. What is being built (Projects)
2. Which AI is working (AI Team)
3. What was learned (Knowledge)
4. What is blocked (Tasks / Reviews cards)
5. What has shipped (Releases)

---

## Build / Lint

Run `npm run build` and `npm run lint` after pull.

---

## Follow-up (not Phase 12)

- `/knowledge` alias redirect
- Per-worker persisted Input / Reasoning / Output records
- Reviews entry in Projects when pending count > 0
