import { NextRequest } from "next/server";
import { agents } from "@/data/mockData";
import { fail, ok } from "@/lib/server/api/response";
import { bootstrapDatabase } from "@/lib/server/db/bootstrap";
import { missionRepository } from "@/lib/server/repositories/missionRepository";
import { taskRepository } from "@/lib/server/repositories/taskRepository";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    bootstrapDatabase();
    const { searchParams } = request.nextUrl;
    const missionId = searchParams.get("mission") ?? undefined;
    const status = searchParams.get("status") ?? undefined;
    const tasks = taskRepository.list({ missionId, status });
    return ok({ tasks });
  } catch {
    return fail("Failed to load tasks");
  }
}

export async function POST(request: NextRequest) {
  try {
    bootstrapDatabase();
    const body = (await request.json()) as {
      title?: string;
      missionId?: string;
      status?: string;
      priority?: string;
      assignedAgentId?: string;
      relatedDecisionId?: string | null;
      createdFrom?: string | null;
      dependencies?: string[];
    };

    if (!body.title || !body.missionId || !body.status || !body.assignedAgentId) {
      return fail("Invalid task payload", 400);
    }

    const mission = missionRepository.getById(body.missionId);
    if (!mission) return fail("Mission not found", 404);

    const agent = agents.find((a) => a.id === body.assignedAgentId);
    if (!agent) return fail("Assigned agent not found", 400);

    const now = "Just now";
    const taskId = `t-${Date.now()}`;
    const created = taskRepository.create({
      id: taskId,
      title: body.title,
      missionId: mission.id,
      missionName: mission.name,
      status: body.status,
      priority: body.priority ?? null,
      relatedDecisionId: body.relatedDecisionId ?? null,
      createdFrom: body.createdFrom ?? "manual",
      assignedTo: agent.role,
      assignedAgentId: agent.id,
      dependencies: body.dependencies ?? [],
      progress: 0,
      eta: "TBD",
      createdAt: now,
      updatedAt: now,
    });

    return ok({ task: created }, { status: 201 });
  } catch {
    return fail("Failed to create task");
  }
}
