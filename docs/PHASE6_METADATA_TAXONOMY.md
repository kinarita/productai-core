# Phase 6-3 Metadata Taxonomy SSOT

## Objective

Centralize replay/governance vocabulary into a single taxonomy source of truth so validation, UI, query, and filtering stay aligned.

## SSOT taxonomy architecture

- Added `lib/replay-query/replayTaxonomy.ts` as canonical source for:
  - replay categories
  - continuity categories
  - replay severities
  - replay sources
  - advisory levels
  - governance categories
- Each taxonomy item defines:
  - `value`
  - `label`
  - `description`
  - `tone`
  - `aliases` (optional)

## Canonical values and aliases

- Canonical values are now emitted across parser/build/normalizer.
- Legacy aliases remain accepted on parse/validate paths for compatibility:
  - `stable`, `degraded`, `review`
  - `runtime_observer`, `coo`, `ceo`, `system`
  - `advisory_low`, `advisory_moderate`, `advisory_elevated`

## Validation flow

1. Input metadata/query values enter parser or API.
2. Validation resolves taxonomy aliases to canonical values.
3. Unknown values fall back to taxonomy fallback defaults.
4. Canonical metadata is persisted and returned.

## UI and filter consistency

- Labels and chips now derive from taxonomy-driven labels/tokens where applicable.
- Replay continuity and severity display wording is unified with shared labels.

## Replay query normalization

- Parser accepts legacy continuity aliases and normalizes to canonical continuity taxonomy.
- Builder emits canonical continuity values only and never emits legacy aliases.

## Observability

- Added `lib/replay-query/replayValidationMetrics.ts` for dev-only normalization counters.
- Runtime view includes a small dev-only normalization metrics section.
