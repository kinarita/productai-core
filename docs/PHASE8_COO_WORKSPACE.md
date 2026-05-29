# Phase 8-1 — AI COO Workspace

## Objective

Introduce an AI COO operational workspace so the CEO can read which missions are progressing, where delivery may stall, and which Mission Team roles may need coordination—without automatic judgment, prioritization, or execution.

## Scope

### New library modules

- `lib/coo/cooWorkspace.ts` — formal COO pipeline stage model (Planning → Reflection)
- `lib/coo/cooMissionAnalysis.ts` — pipeline rows, mission board, mission COO context
- `lib/coo/cooBottleneckDetection.ts` — rule-based bottleneck observations only
- `lib/coo/cooWorkflowSummary.ts` — stage distribution and CEO summary metrics
- `lib/coo/cooRecommendations.ts` — advisory coordination recommendations
- `lib/coo/cooFeed.ts` — COO feed event helpers
- `lib/store/cooWorkspaceStore.ts` — localStorage persistence (`productai-coo-workspace`)
- `lib/hooks/useCooWorkspace.ts` — composed workspace data hook

### New UI

- `components/coo/CooWorkspace.tsx` — full layout: Pipeline, Board, Workflow, Bottlenecks, Recommendations, Decision Context
- `components/coo/CooMissionPipeline.tsx`
- `components/coo/CooMissionBoard.tsx`
- `components/coo/CooWorkflowOverview.tsx`
- `components/coo/CooBottleneckPanel.tsx`
- `components/coo/CooRecommendationsPanel.tsx` (+ `CooWorkspaceSummaryPanel`)
- `components/coo/CooWorkspaceView.tsx`
- `app/coo-workspace/page.tsx`

### Integrations

- **CEO Home** — AI COO Workspace Summary card with link to `/coo-workspace`
- **Mission Detail** — COO Context panel (stage, dependencies, attention, coordination areas)
- **Organization Feed** — COO event types: `coo_review_generated`, `coo_bottleneck_observed`, `coo_coordination_note`, `coo_workflow_snapshot`
- **Sidebar** — AI COO Workspace navigation entry
- **Decision Context** — links to replay, knowledge graph, atlas, traceability (context only)

## COO Pipeline Stage Model

| Stage | Description |
|-------|-------------|
| Planning | Product planning and CEO authorization framing |
| Direction | Mission direction and delivery coordination |
| Architecture | Technical design and system boundaries |
| Design | UX/UI alignment |
| Development | Implementation in progress |
| QA | Quality review and validation |
| Release | Release readiness |
| Reflection | Post-delivery reflection |

Mapped from existing `MissionWorkflowStageId` via `mapMissionToCooStage()`.

## Bottleneck Detection (Rule-Based)

Observations only—labels such as **Potential bottleneck** and **Review suggested**:

- Stage dwell (stale `updatedAt` + limited progress)
- Decision attention concentration (≥ 2 items)
- Tasks blocked or in review
- QA / Design / Architecture wait heuristics

No automatic routing, prioritization, or execution.

## Recommendations Philosophy

Advisory language only, e.g.:

> "Mission Alpha may benefit from additional architecture review."

Forbidden patterns: "should be prioritized", "AI recommends immediate action", "execution initiated".

## Persistence

`localStorage` key `productai-coo-workspace`:

- `selectedMissionId`
- `selectedStage`
- `selectedView`
- `selectedRecommendationId`

## Operational Tone

Calm, delivery-oriented, executive-readable. The COO workspace highlights operational continuity—it does not decide, prioritize, or execute.

## Out of Scope (Phase 8-1)

- Autonomous runtime, execution, automatic delegation
- Automatic prioritization or agent self-planning
- Mission Delivery Workspace (Phase 8-2)
