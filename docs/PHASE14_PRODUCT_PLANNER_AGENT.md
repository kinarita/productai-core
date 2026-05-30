# Phase 14 — Product Planner Agent

## Goal

First real AI worker: transform project idea + target users + success goal into a **traceable** Product Brief with separate **analysis**, **decisions**, and **WHY (reasoning)**.

## Architecture

| Layer | Path |
|-------|------|
| Types | `lib/agents/planner/plannerTypes.ts` |
| Provider contract | `lib/agents/planner/plannerProvider.ts` |
| Implementations | `lib/agents/providers/{mock,openai,anthropic}PlannerProvider.ts` |
| Resolver | `lib/agents/planner/getPlannerProvider.ts` |
| Server runner | `lib/agents/planner/runPlannerAgent.ts` |
| API | `POST /api/agents/planner/generate` |
| Client orchestration | `lib/store/agentRunsStore.ts` (facade: `plannerAgentStore.ts`) |
| UI overlay | `lib/agents/planner/plannerWorkerOverlay.ts` |

## Provider configuration

```bash
# Optional — openai | anthropic | mock (default: openai if OPENAI_API_KEY, else anthropic, else mock)
PLANNER_PROVIDER=mock

OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o

ANTHROPIC_API_KEY=...
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

Without API keys, **MockPlannerProvider** returns structured analysis, decisions, reasoning, and brief (no black box).

## User flow

1. Home → **Start AI Team** → wizard (idea, users, success).
2. **Start AI Team** on step 4 → `createProject` + `generateForMission`.
3. Redirect `/projects/[missionId]` — Input, Planner Reasoning, Generated Brief, Planning Timeline, Activity.
4. AI Team page shows Planner **Idle / Working / Completed / Failed** with spinner and brief preview.

## Audit record

Each run stores: `timestamp`, `model`, `providerId`, `promptVersion`, `input`, `output`, `reasoning` (for future Decision Trail).

## Success criteria

- Enter idea → Start AI Team → observe Planner working → read WHY + Product Brief on project page without advanced workspaces.

## Out of scope (Phase 14)

- Execution, GitHub, MCP, auto-approval, additional agents beyond Planner wiring.
