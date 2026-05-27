import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/server/api/response";
import { bootstrapDatabase } from "@/lib/server/db/bootstrap";
import { judgmentRepository } from "@/lib/server/repositories/judgmentRepository";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    bootstrapDatabase();
    const { searchParams } = request.nextUrl;
    const missionId = searchParams.get("mission") ?? undefined;
    const status = searchParams.get("status") ?? undefined;
    const judgments = judgmentRepository.list({ missionId, status });
    return ok({ judgments });
  } catch {
    return fail("Failed to load judgments");
  }
}
