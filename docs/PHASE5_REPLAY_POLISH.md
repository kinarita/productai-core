# PHASE 5-9: Governance Replay Polish

## Scope

Phase 5-9 finalizes replay UX consistency and governance feed filtering precision.
This phase remains visibility-only and does not automate governance or execution.

## Key updates

- Metadata-driven feed filtering:
  - `OrganizationFeedItem` now carries replay/governance metadata fields.
  - Feed filters now prioritize metadata instead of message text parsing.
- Queue feed metadata normalization:
  - `queueFeedMetadata()` provides category/severity/source/replay tags for governance events.
- Replay chip UX consolidation:
  - Runtime replay filters migrated to `ReplayFilterChips`.
- Replay window semantics:
  - latest/short/medium/extended now map to visible timeline event counts.
- Summary and timeline readability:
  - replay summary includes visible event count and timeline density.
  - timeline supports compact and expanded readability.
- Explainability continuity:
  - explainability text now reflects replay scope and replay window context.

## Human governance continuity

- Replay analytics support interpretation and visibility.
- Replay analytics do not automate governance decisions.
- Human operators remain the authority for operational response.
