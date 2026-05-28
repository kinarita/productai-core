import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/server/api/response";
import { bootstrapDatabase } from "@/lib/server/db/bootstrap";
import {
  coerceDecisionAttentionLifecycle,
  coerceDecisionAttentionSeverity,
  coerceGovernanceAttentionFilter,
  validateDecisionAttentionMetadata,
} from "@/lib/replay-query/decisionAttentionValidation";
import {
  coerceContinuityCategory,
  coerceReplayCategory,
  coerceReplaySeverity,
  coerceReplaySource,
  validateReplayMetadata,
} from "@/lib/replay-query/replayValidation";
import { feedRepository } from "@/lib/server/repositories/feedRepository";
import { missionRepository } from "@/lib/server/repositories/missionRepository";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    bootstrapDatabase();
    const { searchParams } = request.nextUrl;
    const missionId = searchParams.get("mission") ?? undefined;
    const taskId = searchParams.get("task") ?? undefined;
    const type = searchParams.get("type") ?? undefined;
    const status = searchParams.get("status") ?? undefined;
    const governanceCategory = searchParams.get("governanceCategory") ?? undefined;
    const replayCategoryRaw = searchParams.get("replayCategory") ?? undefined;
    const continuityCategoryRaw = searchParams.get("continuityCategory") ?? undefined;
    const replaySeverityRaw = searchParams.get("replaySeverity") ?? undefined;
    const replaySourceRaw = searchParams.get("replaySource") ?? undefined;
    const governanceAttentionRaw =
      searchParams.get("governanceAttention") ?? searchParams.get("attention") ?? undefined;
    const decisionAttentionId = searchParams.get("decisionAttentionId") ?? undefined;
    const decisionAttentionSeverityRaw = searchParams.get("decisionAttentionSeverity") ?? undefined;
    const decisionAttentionLifecycleRaw = searchParams.get("decisionAttentionLifecycle") ?? undefined;

    const replayCategory = replayCategoryRaw ? coerceReplayCategory(replayCategoryRaw) : undefined;
    const continuityCategory = continuityCategoryRaw
      ? coerceContinuityCategory(continuityCategoryRaw)
      : undefined;
    const replaySeverity = replaySeverityRaw ? coerceReplaySeverity(replaySeverityRaw) : undefined;
    const replaySource = replaySourceRaw ? coerceReplaySource(replaySourceRaw) : undefined;
    const governanceAttention = governanceAttentionRaw
      ? coerceGovernanceAttentionFilter(governanceAttentionRaw)
      : undefined;
    const decisionAttentionSeverity = decisionAttentionSeverityRaw
      ? coerceDecisionAttentionSeverity(decisionAttentionSeverityRaw)
      : undefined;
    const decisionAttentionLifecycle = decisionAttentionLifecycleRaw
      ? coerceDecisionAttentionLifecycle(decisionAttentionLifecycleRaw)
      : undefined;

    const feed = feedRepository.list({
      missionId,
      taskId,
      type,
      status,
      governanceCategory,
      replayCategory,
      continuityCategory,
      replaySeverity,
      replaySource,
      governanceAttention: governanceAttention === "all" ? undefined : governanceAttention,
      decisionAttentionId,
      decisionAttentionSeverity,
      decisionAttentionLifecycle,
    });
    return ok({ feed });
  } catch {
    return fail("Failed to load feed");
  }
}

export async function POST(request: NextRequest) {
  try {
    bootstrapDatabase();
    const body = (await request.json()) as {
      missionId?: string;
      taskId?: string | null;
      decisionId?: string | null;
      type?: string;
      status?: string | null;
      message?: string;
      agentId?: string;
      title?: string;
      author?: string;
      authorName?: string;
      governanceCategory?: string;
      replayCategory?: string;
      continuityCategory?: string;
      advisoryLevel?: string;
      replaySeverity?: string;
      replaySource?: string;
      replayTags?: string[];
      metadata?: Record<string, unknown>;
      decisionAttentionId?: string;
      decisionAttentionSeverity?: string;
      decisionAttentionCategory?: string;
      decisionAttentionReason?: string;
      decisionAttentionSource?: string;
      decisionAttentionReplayConfidence?: string;
      decisionAttentionContinuityCategory?: string;
      decisionAttentionLifecycle?: string;
    };

    const metadata = validateReplayMetadata({
      governanceCategory: body.governanceCategory,
      replayCategory: body.replayCategory,
      continuityCategory: body.continuityCategory,
      advisoryLevel: body.advisoryLevel,
      replaySeverity: body.replaySeverity,
      replaySource: body.replaySource,
      replayTags: body.replayTags,
    });
    const attention = validateDecisionAttentionMetadata({
      decisionAttentionId: body.decisionAttentionId,
      decisionAttentionSeverity: body.decisionAttentionSeverity,
      decisionAttentionCategory: body.decisionAttentionCategory,
      decisionAttentionReason: body.decisionAttentionReason,
      decisionAttentionSource: body.decisionAttentionSource,
      decisionAttentionReplayConfidence: body.decisionAttentionReplayConfidence,
      decisionAttentionContinuityCategory: body.decisionAttentionContinuityCategory,
      decisionAttentionLifecycle: body.decisionAttentionLifecycle,
    });
    const rawMetadata = body.metadata;
    const safeMetadata =
      rawMetadata && typeof rawMetadata === "object" && !Array.isArray(rawMetadata)
        ? rawMetadata
        : null;

    if (!body.missionId || !body.type || !body.message) {
      return fail("Invalid feed payload", 400);
    }

    const mission = missionRepository.getById(body.missionId);
    if (!mission) return fail("Mission not found", 404);

    const created = feedRepository.create({
      id: `f-live-${Date.now()}`,
      missionId: mission.id,
      missionName: mission.name,
      taskId: body.taskId ?? null,
      decisionId: body.decisionId ?? null,
      type: body.type,
      status: body.status ?? null,
      author: body.author ?? "COO",
      authorName: body.authorName ?? "Nova",
      message: body.message,
      governanceCategory: metadata.governanceCategory,
      replayCategory: metadata.replayCategory,
      continuityCategory: metadata.continuityCategory,
      advisoryLevel: metadata.advisoryLevel,
      replaySeverity: metadata.replaySeverity,
      replaySource: metadata.replaySource,
      replayTags: metadata.replayTags,
      metadata: safeMetadata,
      decisionAttentionId: attention.decisionAttentionId ?? null,
      decisionAttentionSeverity: attention.decisionAttentionSeverity ?? null,
      decisionAttentionCategory: attention.decisionAttentionCategory ?? null,
      decisionAttentionReason: attention.decisionAttentionReason ?? null,
      decisionAttentionSource: attention.decisionAttentionSource ?? null,
      decisionAttentionReplayConfidence: attention.decisionAttentionReplayConfidence ?? null,
      decisionAttentionContinuityCategory: attention.decisionAttentionContinuityCategory ?? null,
      decisionAttentionLifecycle: attention.decisionAttentionLifecycle ?? null,
      createdAt: "Just now",
    });
    return ok({ feedItem: created }, { status: 201 });
  } catch {
    return fail("Failed to create feed item");
  }
}
