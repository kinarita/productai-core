#!/usr/bin/env node

const baseUrl = process.env.PRODUCTAI_BASE_URL ?? "http://localhost:3000";

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

function pickMissionId(missions) {
  if (!Array.isArray(missions) || missions.length === 0) {
    throw new Error("No missions available for verification.");
  }
  return missions[0].id;
}

async function createFeedItem(missionId, metadataMode) {
  const validPayload = {
    missionId,
    type: "coordination",
    status: "active",
    author: "COO",
    authorName: "Nova",
    message: "Metadata verification event for governance replay continuity.",
    governanceCategory: "governance_replay",
    replayCategory: "replay_timeline",
    continuityCategory: "continuity_replay",
    advisoryLevel: "advisory",
    replaySeverity: "moderate",
    replaySource: "replay",
    replayTags: ["verification", "replay", "metadata"],
    metadata: { verificationMode: metadataMode, source: "phase6-2" },
  };
  const invalidPayload = {
    ...validPayload,
    message: "Invalid metadata verification event to test fallback continuity.",
    replayCategory: "unknown_replay_value",
    continuityCategory: "degraded",
    advisoryLevel: "unknown_advisory",
    replaySeverity: "invalid_severity",
    replaySource: "alien_source",
    replayTags: ["", "verification", 42],
    metadata: { verificationMode: "invalid-fallback" },
  };

  const payload = metadataMode === "invalid-fallback" ? invalidPayload : validPayload;
  const created = await requestJson("/api/feed", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  return created.feedItem;
}

async function verify() {
  const { missions } = await requestJson("/api/missions");
  const missionId = pickMissionId(missions);

  const createdValid = await createFeedItem(missionId, "valid-roundtrip");
  const createdInvalid = await createFeedItem(missionId, "invalid-fallback");

  const { feed } = await requestJson(`/api/feed?mission=${missionId}`);
  const feedIds = new Set(feed.map((item) => item.id));
  assert(feedIds.has(createdValid.id), "Created valid feed item is not listed by GET /api/feed.");
  assert(feedIds.has(createdInvalid.id), "Created invalid feed item is not listed by GET /api/feed.");

  const { feedItem: byIdValid } = await requestJson(`/api/feed/${createdValid.id}`);
  const { feedItem: byIdInvalid } = await requestJson(`/api/feed/${createdInvalid.id}`);

  assert(byIdValid.replayCategory === "replay_timeline", "Valid replayCategory was not preserved.");
  assert(byIdValid.continuityCategory === "continuity_replay", "Valid continuityCategory was not preserved.");
  assert(byIdValid.replaySeverity === "moderate", "Valid replaySeverity was not preserved.");
  assert(byIdValid.replaySource === "replay", "Valid replaySource was not preserved.");
  assert(Array.isArray(byIdValid.replayTags) && byIdValid.replayTags.includes("metadata"), "Valid replayTags were not preserved.");

  assert(byIdInvalid.replayCategory === "replay_governance", "Invalid replayCategory was not normalized.");
  assert(byIdInvalid.continuityCategory === "continuity_advisory", "Legacy/invalid continuityCategory was not normalized.");
  assert(byIdInvalid.replaySeverity === "moderate", "Invalid replaySeverity was not normalized.");
  assert(byIdInvalid.replaySource === "governance", "Invalid replaySource was not normalized.");
  assert(byIdInvalid.advisoryLevel === "advisory", "Invalid advisoryLevel was not normalized.");

  console.table([
    {
      check: "POST success",
      result: "passed",
      detail: "Valid and invalid metadata payloads accepted with safe normalization.",
    },
    {
      check: "metadata persisted",
      result: "passed",
      detail: "Created feed items returned by GET /api/feed.",
    },
    {
      check: "metadata restored",
      result: "passed",
      detail: "GET /api/feed/:id preserved normalized metadata fields.",
    },
    {
      check: "invalid metadata fallback",
      result: "passed",
      detail: "Unknown taxonomy values fell back safely without API failure.",
    },
    {
      check: "replay continuity preserved",
      result: "passed",
      detail: "Legacy continuity value normalized to continuity_advisory.",
    },
  ]);
}

verify()
  .then(() => {
    console.log("Feed metadata API verification completed.");
  })
  .catch((error) => {
    console.error("Feed metadata API verification failed:", error.message);
    process.exit(1);
  });
