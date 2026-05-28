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

async function verify() {
  const { missions } = await requestJson("/api/missions");
  const missionId = pickMissionId(missions);
  const attentionId = `attention-verify-${Date.now()}`;

  const created = await requestJson("/api/feed", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      missionId,
      type: "decision_attention_generated",
      status: "in_review",
      author: "COO",
      authorName: "Nova",
      message:
        "Executive review attention has been recorded for continuity interpretation. Verification payload.",
      governanceCategory: "governance_review",
      replayCategory: "replay_review",
      continuityCategory: "continuity_review",
      advisoryLevel: "advisory_moderate",
      replaySeverity: "moderate",
      replaySource: "coo",
      replayTags: ["decision_attention", "verification"],
      decisionAttentionId: attentionId,
      decisionAttentionSeverity: "elevated_review",
      decisionAttentionCategory: "executive_review",
      decisionAttentionReason: "Verification attention reason for replay traceability.",
      decisionAttentionSource: "diagnostics",
      decisionAttentionReplayConfidence: "moderate",
      decisionAttentionContinuityCategory: "continuity_review",
      decisionAttentionLifecycle: "generated",
    }),
  });

  const item = created.feedItem;
  assert(item.id, "POST did not return feed item id.");
  assert(item.decisionAttentionId === attentionId, "decisionAttentionId was not persisted.");
  assert(item.decisionAttentionSeverity === "elevated_review", "decisionAttentionSeverity was not persisted.");
  assert(item.decisionAttentionLifecycle === "generated", "decisionAttentionLifecycle was not persisted.");
  assert(item.decisionAttentionReplayConfidence === "moderate", "decisionAttentionReplayConfidence was not persisted.");

  const { feedItem: byId } = await requestJson(`/api/feed/${item.id}`);
  assert(byId.decisionAttentionId === attentionId, "GET /api/feed/:id did not restore decisionAttentionId.");
  assert(byId.decisionAttentionCategory === "executive_review", "GET /api/feed/:id did not restore category.");

  const { feed: attentionFeed } = await requestJson(
    `/api/feed?mission=${missionId}&governanceAttention=attention`
  );
  assert(
    attentionFeed.some((entry) => entry.id === item.id),
    "GET /api/feed?governanceAttention=attention did not include created item."
  );

  const { feed: lifecycleFeed } = await requestJson(
    `/api/feed?mission=${missionId}&governanceAttention=generated`
  );
  assert(
    lifecycleFeed.some((entry) => entry.id === item.id),
    "GET /api/feed?governanceAttention=generated did not include created item."
  );

  const { feed: severityFeed } = await requestJson(
    `/api/feed?mission=${missionId}&decisionAttentionSeverity=elevated_review`
  );
  assert(
    severityFeed.some((entry) => entry.id === item.id),
    "GET /api/feed?decisionAttentionSeverity did not include created item."
  );

  console.table([
    { check: "POST decision attention metadata", result: "passed" },
    { check: "GET /api/feed/:id restore", result: "passed" },
    { check: "governanceAttention filter", result: "passed" },
    { check: "lifecycle filter", result: "passed" },
    { check: "severity filter", result: "passed" },
  ]);
  console.log("Decision attention feed metadata verification passed.");
}

verify().catch((error) => {
  console.error(error);
  process.exit(1);
});
