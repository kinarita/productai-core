# Phase 7-7 — Executive Replay Personalization & Governance Bookmarking

## Purpose

Evolve replay from explainable (Phase 7-6) to **sustainably usable** for executives and governance reviewers—through bookmarks, interpretation presets, and reading continuity—without autonomous execution.

## Replay personalization philosophy

ProductAI supports **continuous understanding and operation** of an AI organization—not autonomous task execution. Personalization stores view continuity in the browser only.

## Bookmark continuity semantics

- Bookmarks save `replayQuery` snapshots for recurring governance reading
- They are **view continuity**, not task automation
- Persisted in `productai-replay-bookmarks` (localStorage)

## Interpretation presets

Four presets in `replayInterpretationPresets.ts`:

| Preset | Focus |
|--------|--------|
| Executive overview | Visibility, stability, governance density |
| Runtime continuity | Advisory density, runtime instability |
| Governance review | Review concentration, elevated density |
| Attention interpretation | Why attention appears, governance memory |

## Personalization layer

`replayPersonalizationStore` holds:

- `preferredReplayScope`, `preferredReplayWindow`, `preferredSeverityFocus`
- `preferredInterpretationPreset`, `lastReplayView`
- `continuityMemory` (via `recordReplayContinuityContext`)
- `readabilityMode` (compact / expanded)

Applied on Runtime load when URL has no query overrides.

## Replay continuity memory

`replayContinuityMemory.ts` tracks recent scopes, windows, attention categories, and continuity focus—executive reading continuity only.

## Export refinement

`replayExportContext.ts` exports:

- replay query, scope/window
- continuity explanation
- interpretation preset title
- diagnostics summary

Explicitly excludes execution intent, authorization state, and operator state.

## Cross-view portability

Bookmarks and presets use `buildReplayHref()` and `mergeReplayQuery()` across CEO Home, Runtime, Mission, Feed, and Judgment.

## Intentionally excluded scope

- Autonomous governance, auto prioritization, automatic replay actions
- AI execution routing, background workers, attention escalation automation
- Backend persistence for bookmarks or personalization

## Operational tone

Preferred: *Replay bookmarks help maintain continuity across governance interpretation sessions.*

Avoid: *The AI system intelligently adapts replay monitoring behavior automatically.*
