import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/server/api/response";
import { bootstrapDatabase } from "@/lib/server/db/bootstrap";
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
    const replayCategory = searchParams.get("replayCategory") ?? undefined;
    const continuityCategory = searchParams.get("continuityCategory") ?? undefined;
    const replaySeverity = searchParams.get("replaySeverity") ?? undefined;
    const replaySource = searchParams.get("replaySource") ?? undefined;

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
    };

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
      governanceCategory: body.governanceCategory ?? null,
      replayCategory: body.replayCategory ?? null,
      continuityCategory: body.continuityCategory ?? null,
      advisoryLevel: body.advisoryLevel ?? null,
      replaySeverity: body.replaySeverity ?? null,
      replaySource: body.replaySource ?? null,
      replayTags: body.replayTags ?? [],
      metadata: body.metadata ?? null,
      createdAt: "Just now",
    });
    return ok({ feedItem: created }, { status: 201 });
  } catch {
    return fail("Failed to create feed item");
  }
}
