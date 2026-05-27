import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/server/api/response";
import { bootstrapDatabase } from "@/lib/server/db/bootstrap";
import { missionRepository } from "@/lib/server/repositories/missionRepository";

export const runtime = "nodejs";

export async function GET(_: NextRequest) {
  try {
    bootstrapDatabase();
    const missions = missionRepository.list();
    return ok({ missions });
  } catch {
    return fail("Failed to load missions");
  }
}
