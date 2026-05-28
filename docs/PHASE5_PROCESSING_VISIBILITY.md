# Phase 5-4 — Processing Governance Visibility Analytics

## Objective

Elevate processing governance into executive visibility with derived analytics, reviewability, and mission/organization risk context.

## Visibility architecture

- `lib/orchestration/processing/processingAnalytics.ts`
- `ProcessingGovernanceSummary` model in `processingTypes.ts`
- Derived-only analytics (no runtime control, no execution automation)

Core metrics include:

- review-required count
- paused/revoked/denied count
- advisory-only ratio
- severity distribution
- reason category distribution
- runtime/provider instability distribution
- mission-level governance risk density
- governance continuity score (0-100)

## Executive analytics philosophy

Analytics are governance visibility signals for CEO/COO decisions.
They do not trigger autonomous actions or execution controls.

## UI integration

- Runtime & Cost: Processing Governance Analytics + review queue + calm filters
- Mission Detail: Processing Governance Summary with continuity health
- CEO Home: Governance Risk Summary with mission drilldown
- Task Detail: structured governance reason filters for reviewability

## Scope boundary

- No operational execution
- No MCP/GitHub/Claude Code execution
- No deployment automation
- No autonomous orchestration or realtime background processing
