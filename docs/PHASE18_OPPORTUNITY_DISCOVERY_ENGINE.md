# Phase 18 — Opportunity Discovery Engine

## Goal

Evolve Product Planner from a Product Brief generator into an **Opportunity Discovery Agent** that validates *whether a product should be built* before Architect handoff.

## Flow

```
Idea → Opportunity Discovery → Customer Problem Fit → Problem-Solution Fit → MVP → Planning → Review
```

## Opportunity Brief

Structured artifact (`OpportunityBrief`) with:

- Opportunity Summary
- Target Segment
- Customer Pain
- Current Alternatives
- Why Existing Solutions Fail
- Opportunity Hypothesis
- Evidence Level (`low` | `medium` | `high`)
- Planner Confidence (0–100)
- Recommended Action (`proceed` | `needs_validation` | `hold`)

Generated **before** Product Brief via `POST /api/agents/planner/opportunity` (hypothesis-based heuristics; no web research).

## PMF Journey

- New stage: `opportunity_discovery`
- `PmfReadiness.opportunityDiscovery` score (0–100)

## Discovery insights

Assessment and UI now include:

- `strengths`, `gaps`, `nextActions` (Phase 17)
- `opportunities`, `threats` (Phase 18)

## Audit fields

`AgentAuditRecord` extensions:

- `opportunityScore`
- `customerPainConfidence`
- `evidenceLevel`
- `recommendedAction`

## UI

| Component | Location |
|-----------|----------|
| `OpportunityBriefCard` | Project hub — below PMF Journey |
| `ShouldWeBuildCard` | Projects dashboard (featured project) |
| `PMFJourneyPanel` | Updated stage list |

## Planner prompt

`planner-v4` — assess prompt references Opportunity Discovery and PMF `opportunityDiscovery` score.

## Out of scope

- Architect Agent execution
- Market Research Agent
- Web search / competitor deep analysis

## Key files

- `lib/opportunity/opportunityTypes.ts`
- `lib/opportunity/buildOpportunityBrief.ts`
- `lib/agents/planner/runPlannerOpportunity.ts`
- `app/api/agents/planner/opportunity/route.ts`
- `components/projects/OpportunityBriefCard.tsx`
- `components/projects/ShouldWeBuildCard.tsx`
