#!/usr/bin/env node

const baseUrl = process.env.PRODUCTAI_BASE_URL ?? "http://localhost:3000";

const SEED_IDS = [
  "f-attn-generated",
  "f-attn-reviewed",
  "f-attn-resolved",
  "f-attn-deferred",
];

const LIFECYCLES = ["generated", "reviewed", "resolved", "deferred"];

async function requestJson(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  const json = await response.json();
  if (!response.ok || !json?.ok) {
    throw new Error(`${path} failed: ${response.status} ${json?.error ?? "Unknown error"}`);
  }
  return json.data;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function taxonomyNormalized(item) {
  return (
    item.governanceCategory === "governance_review" &&
    item.replayCategory === "replay_review" &&
    Boolean(item.continuityCategory) &&
    Boolean(item.replaySeverity) &&
    Boolean(item.replaySource) &&
    Array.isArray(item.replayTags) &&
    Boolean(item.decisionAttentionLifecycle)
  );
}

async function verify() {
  const before = await requestJson("/api/feed/replay-seeds");
  const first = await requestJson("/api/feed/replay-seeds", { method: "POST" });
  assert(
    first.inserted + first.skipped === SEED_IDS.length,
    `Expected ${SEED_IDS.length} seed operations, got inserted=${first.inserted} skipped=${first.skipped}`
  );

  if (before.missingSeeds.length > 0) {
    assert(first.inserted > 0, "Expected missing seeds to be inserted on first refresh.");
  }

  const second = await requestJson("/api/feed/replay-seeds", { method: "POST" });
  assert(second.inserted === 0, `Duplicate refresh inserted ${second.inserted} items.`);
  assert(second.skipped === SEED_IDS.length, "Expected all seeds skipped on second refresh.");

  const after = await requestJson("/api/feed/replay-seeds");
  assert(after.availableSeeds === SEED_IDS.length, "Expected all decision attention seeds available.");
  assert(after.missingSeeds.length === 0, `Still missing seeds: ${after.missingSeeds.join(", ")}`);
  assert(after.hydrationReady, "Expected hydration-ready replay seed diagnostics.");

  for (const lifecycle of LIFECYCLES) {
    assert(
      after.continuityCoverage[lifecycle],
      `Expected continuity coverage for lifecycle ${lifecycle}.`
    );
  }

  for (const lifecycle of LIFECYCLES) {
    const { feed } = await requestJson(`/api/feed?governanceAttention=${lifecycle}`);
    assert(feed.length >= 1, `Expected governanceAttention=${lifecycle} feed results.`);
    const seed = feed.find((item) => item.decisionAttentionLifecycle === lifecycle);
    assert(seed, `No seed item for lifecycle ${lifecycle}.`);
    assert(taxonomyNormalized(seed), `Seed metadata not normalized for ${lifecycle}.`);
  }

  const attention = await requestJson("/api/feed?governanceAttention=attention");
  assert(attention.feed.length >= 4, "Expected governanceAttention=attention to return seed items.");

  console.log("verifyReplaySeedRefresh: PASS");
  console.log(
    JSON.stringify(
      {
        firstRefresh: { inserted: first.inserted, skipped: first.skipped },
        secondRefresh: { inserted: second.inserted, skipped: second.skipped },
        hydrationReady: after.hydrationReady,
      },
      null,
      2
    )
  );
}

verify().catch((error) => {
  console.error("verifyReplaySeedRefresh: FAIL");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
