import { NextRequest } from "next/server";
import { agents } from "@/data/mockData";
import { fail, ok } from "@/lib/server/api/response";
import { bootstrapDatabase } from "@/lib/server/db/bootstrap";
import { taskRepository } from "@/lib/server/repositories/taskRepository";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ taskId: string }>;
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    bootstrapDatabase();
    const { taskId } = await params;
    const task = taskRepository.getById(taskId);
    if (!task) return fail("Task not found", 404);
    return ok({ task });
  } catch {
    return fail("Failed to load task");
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    bootstrapDatabase();
    const { taskId } = await params;
    const body = (await request.json()) as {
      status?: string;
      assignedAgentId?: string;
      priority?: string | null;
      dependencies?: string[];
      updatedAt?: string;
    };

    if (
      body.status === undefined &&
      body.assignedAgentId === undefined &&
      body.priority === undefined &&
      body.dependencies === undefined &&
      body.updatedAt === undefined
    ) {
      return fail("No patch fields provided", 400);
    }

    let assignedTo: string | undefined;
    if (body.assignedAgentId) {
      const agent = agents.find((a) => a.id === body.assignedAgentId);
      if (!agent) return fail("Assigned agent not found", 400);
      assignedTo = agent.role;
    }

    const updated = taskRepository.update(taskId, {
      status: body.status,
      assignedAgentId: body.assignedAgentId,
      assignedTo,
      priority: body.priority,
      dependencies: body.dependencies,
      updatedAt: body.updatedAt ?? "Just now",
    });

    if (!updated) return fail("Task not found", 404);
    return ok({ task: updated });
  } catch {
    return fail("Failed to update task");
  }
}
