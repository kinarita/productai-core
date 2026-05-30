# Phase 17 — Discovery Mode & PMF Journey Framework

## Vision

ProductAI flow extends from **Idea → Product Brief** to:

**Idea → Discovery → PMF Journey → Product Brief**

The Planner helps answer *"Should this product be built?"* before *"How should this product be built?"*

## Core principle

Users should not feel like they are filling out a consulting framework. The AI performs most analysis; the user answers only the minimum necessary questions.

## Discovery modes

| Mode | Audience | Experience | Question limits |
|------|----------|------------|-----------------|
| `quick` | Students, parents, first-time founders, hobby projects | ~3–5 min | Max **3 questions total** |
| `guided` | Founders, PMs, consultants | ~10–30 min | Max **10 questions per round**, **3 rounds** |

Stored on mission and planner run as `discoveryMode`.

## Project creation wizard

1. Project idea  
2. **Discovery mode** (Quick / Guided)  
3. Target users  
4. Success goal  
5. Start AI team  

## PMF journey model

`lib/pmf/pmfJourney.ts`

- `PmfStage`: `idea_validation` | `cpf` | `psf` | `mvp` | `pmf`
- `PmfReadiness`: scores 0–100 per stage
- Mission fields: `currentPmfStage`, `pmfReadiness`, `discoveryMode`

## Planner gap analysis

Assessment output includes:

- `strengths: string[]`
- `gaps: string[]`
- `nextActions: string[]`
- `pmfReadiness: PmfReadiness`

## Smart clarification

- Questions only when confidence is low; assumptions preferred over interrogation (`assumption` on `PlannerQuestion`).
- Heuristic + LLM assessment via `planner-v3` prompts.
- `questionsAskedSoFar` enforces mode caps.

## UI

| Component | Location |
|-----------|----------|
| `PMFJourneyPanel` | Project hub (`/projects/[missionId]`) |
| `PmfJourneyDashboardCard` | Projects dashboard (featured project) |
| `ProjectPlannerSections` | Discovery insights (strengths / gaps / next actions) |

Human-first copy (no CPF/PSF jargon by default); optional detail expand on journey panel.

## Timeline

Extended stages: Idea → Discovery → Clarification → Problem (CPF) → Solution (PSF) → MVP → Planning → Review → Architecture → Design → Build → QA → Release.

## Audit

`AgentAuditRecord` extended with:

- `discoveryMode`, `pmfStage`, `pmfScore`, `strengths`, `gaps`, `nextActions`

All discovery assess/clarify/brief cycles append to `auditTrail`.

## Activity feed

- Discovery started  
- PMF assessment completed  
- Planner identified gaps  
- Planner requested clarification  
- User answered clarification  
- Planner updated PMF readiness  

## Scope boundaries (kept)

- No Architect execution  
- No auto approval  
- No GitHub / deployment  

## Key files

- `lib/pmf/pmfJourney.ts`
- `lib/agents/planner/plannerClarification.ts`
- `lib/store/agentRunsStore.ts`
- `components/projects/ProjectCreationWizard.tsx`
- `components/projects/PMFJourneyPanel.tsx`
- `components/projects/PmfJourneyDashboardCard.tsx`
