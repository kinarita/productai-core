import { NextRequest, NextResponse } from "next/server";
import { bootstrapDatabase } from "@/lib/server/db/bootstrap";
import { feedRepository } from "@/lib/server/repositories/feedRepository";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  bootstrapDatabase();
  const { searchParams } = request.nextUrl;
  const missionId = searchParams.get("mission") ?? undefined;
  const taskId = searchParams.get("task") ?? undefined;
  const type = searchParams.get("type") ?? undefined;
  const status = searchParams.get("status") ?? undefined;

  const feed = feedRepository.list({ missionId, taskId, type, status });
  return NextResponse.json({ feed });
}
