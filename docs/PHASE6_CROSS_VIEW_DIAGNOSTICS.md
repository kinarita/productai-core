# Phase 6-5 Cross-View Replay Diagnostics Consistency

## Objective

Unify replay diagnostics semantics across Runtime, CEO, and Mission views so continuity interpretation remains consistent everywhere.

## Cross-view diagnostics architecture

- Replay diagnostics now use centralized configuration:
  - `lib/replay-query/replayDiagnosticsConfig.ts`
- Shared wording helpers:
  - `lib/replay-query/replayDiagnosticsHelpers.ts`
- Shared derivation remains in:
  - `lib/replay-query/replayDiagnostics.ts`

## Replay visibility consistency

- Visibility score derivation uses one shared formula and thresholds.
- Runtime, CEO, and Mission now display the same derived score semantics.

## Continuity wording portability

- Shared continuity stability labels are reused across views.
- Stable continuity wording is preserved consistently:
  - "Replay continuity appears stable across recent governance windows."

## Diagnostics configuration

Config centralizes weighting and thresholds:

- metadata completeness weight
- advisory/review density thresholds
- compression penalty controls
- confidence thresholds
- completeness warning threshold

This reduces hardcoded numbers and keeps diagnostics tuning controlled.

## Explainability portability

- Governance explainability card now accepts replay diagnostics directly.
- Runtime keeps replay diagnostics explanations aligned with shared wording.

## Advisory philosophy

Replay diagnostics remain advisory and visibility-focused:

- no execution side effects
- no autonomous control
- no operational processing activation
