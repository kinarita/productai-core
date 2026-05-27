import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/server/api/response";
import { bootstrapDatabase } from "@/lib/server/db/bootstrap";
import { judgmentRepository } from "@/lib/server/repositories/judgmentRepository";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ decisionId: string }>;
}

const allowedStatuses = ["approved", "rejected", "pending", "revision_requested"];

export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    bootstrapDatabase();
    const { decisionId } = await params;
    const judgment = judgmentRepository.getById(decisionId);
    if (!judgment) return fail("Decision not found", 404);
    return ok({ judgment });
  } catch {
    return fail("Failed to load decision");
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    bootstrapDatabase();
    const { decisionId } = await params;
    const body = (await request.json()) as {
      status?: string;
      selectedOption?: string | null;
      updatedAt?: string;
    };
    if (!body.status || !allowedStatuses.includes(body.status)) {
      return fail("Invalid decision status", 400);
    }
    const judgment = judgmentRepository.updateStatus(decisionId, {
      status: body.status,
      selectedOption: body.selectedOption ?? null,
      updatedAt: body.updatedAt ?? "Just now",
    });
    if (!judgment) return fail("Decision not found", 404);
    return ok({ judgment });
  } catch {
    return fail("Failed to update decision");
  }
}
