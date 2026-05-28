# Phase 7-5 — Decision Attention Seed Refresh & Development Stability

## Purpose

Stabilize replay and governance traceability in development by ensuring decision attention seed feed items remain available after hydration, existing databases, and repeated local resets—without autonomous runtime behavior.

## Replay seed philosophy

Decision attention seeds are **continuity examples** for executive interpretation. They are not live autonomous governance events. Wording stays calm, operational, and recommendation-first.

## Idempotent refresh policy

`refreshDecisionAttentionSeeds()` follows **INSERT IF MISSING** only:

| Seed ID | Lifecycle |
|---------|-----------|
| `f-attn-generated` | generated |
| `f-attn-reviewed` | reviewed |
| `f-attn-resolved` | resolved |
| `f-attn-deferred` | deferred |

- Missing ID → insert with taxonomy-normalized metadata
- Existing ID → skip (no update, delete, or overwrite)
- Safe to run repeatedly

## Development continuity strategy

1. **Catalog** — `lib/replay-query/replaySeedCatalog.ts` builds payloads from `replayTaxonomy`, `replayLabels`, `replayMetadata`, and validation helpers.
2. **Repository** — `FeedRepository.upsertReplaySeedFeedItem()` performs idempotent create.
3. **API** — `GET/POST /api/feed/replay-seeds` for diagnostics and refresh.
4. **Settings** — “Replay Development Seeds” section with “Refresh Replay Seeds”.
5. **Organization Feed** — read-only supplemental seeds when attention filters are active and store items are missing (minimal, non-noisy).

## Hydration readiness

`buildReplaySeedDiagnostics()` reports:

- `totalSeeds`, `availableSeeds`, `missingSeeds`
- `hydrationReady` when all four lifecycle seeds exist with coverage
- `continuityCoverage` for generated / reviewed / resolved / deferred
- optional `lastRefreshAt` (client-recorded after manual refresh)

Runtime Cost shows **Replay Seed Status** in development only.

## Verification

```bash
npm run dev
node scripts/verifyReplaySeedRefresh.mjs
```

## Intentionally excluded scope

- Autonomous runtime or execution automation
- MCP / GitHub execution
- Background workers or self-healing
- Automatic governance actions
- Seed snapshot portability (Phase 7-6 direction)
