import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/server/api/response";
import { bootstrapDatabase } from "@/lib/server/db/bootstrap";
import { feedRepository } from "@/lib/server/repositories/feedRepository";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ feedId: string }>;
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    bootstrapDatabase();
    const { feedId } = await params;
    const feedItem = feedRepository.getById(feedId);
    if (!feedItem) return fail("Feed item not found", 404);
    return ok({ feedItem });
  } catch {
    return fail("Failed to load feed item");
  }
}
