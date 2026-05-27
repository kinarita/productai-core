import { NextResponse } from "next/server";
import { bootstrapDatabase } from "@/lib/server/db/bootstrap";
import { missionRepository } from "@/lib/server/repositories/missionRepository";

export const runtime = "nodejs";

export async function GET() {
  bootstrapDatabase();
  const missions = missionRepository.list();
  return NextResponse.json({ missions });
}
