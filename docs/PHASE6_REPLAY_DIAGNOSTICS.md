# Phase 6-4 Replay Diagnostics and Governance Observability

## Objective

Extend the replay/governance layer with explainable observability so executive users can understand why replay visibility appears as shown in the selected scope and window.

## Replay diagnostics architecture

- Added `lib/replay-query/replayDiagnostics.ts` as a derived diagnostics layer.
- Diagnostics are advisory/reference only and do not drive autonomous behavior.
- Diagnostics consume:
  - visible replay events
  - full replay event count
  - feed metadata completeness
  - replay query scope/window context
  - governance memory patterns

## Visibility scoring

- `replayVisibilityScore` is derived in the `0-100` range.
- Inputs include:
  - metadata completeness ratio
  - review/advisory concentration
  - replay compression concentration
  - continuity scope consistency

## Replay confidence semantics

- Confidence levels:
  - `high`
  - `moderate`
  - `limited`
- Confidence is derived from visibility score and metadata completeness.

## Continuity diagnostics

- Continuity diagnostics states:
  - `stable`
  - `elevated_review`
  - `advisory_dense`
- Explanations are generated in calm governance wording.

## Diagnostics warnings

Warnings remain calm and executive-readable, for example:

- metadata completeness reduced
- replay view condensed for executive readability
- advisory density elevated
- review concentration elevated
- legacy replay alias normalized

## Explainability flow

1. Replay timeline and visible window are derived.
2. Diagnostics are calculated from current replay context.
3. Explainability and summary panels render diagnostics explanations.
4. Runtime observability presents score, confidence, completeness, density, and warnings.

## Advisory philosophy

Replay diagnostics remain visibility guidance only:

- no execution triggers
- no autonomous remediation
- no operational processing implications
