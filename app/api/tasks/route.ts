import { NextRequest, NextResponse } from "next/server";
import { bootstrapDatabase } from "@/lib/server/db/bootstrap";
import { taskRepository } from "@/lib/server/repositories/taskRepository";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  bootstrapDatabase();
  const { searchParams } = request.nextUrl;
  const missionId = searchParams.get("mission") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const tasks = taskRepository.list({ missionId, status });
  return NextResponse.json({ tasks });
}
