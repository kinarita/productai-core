import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/server/api/response";
import { bootstrapDatabase } from "@/lib/server/db/bootstrap";
import { buildReplaySeedDiagnosticsFromDatabase } from "@/lib/server/replay/replaySeedDiagnosticsServer";
import { refreshDecisionAttentionSeedsCore } from "@/lib/server/replay/replaySeedRefreshCore";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    bootstrapDatabase();
    const lastRefreshAt = request.nextUrl.searchParams.get("lastRefreshAt");
    const diagnostics = buildReplaySeedDiagnosticsFromDatabase(lastRefreshAt);
    return ok(diagnostics);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load replay seed diagnostics");
  }
}

export async function POST() {
  try {
    bootstrapDatabase();
    const result = refreshDecisionAttentionSeedsCore();
    return ok(result);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to refresh replay seeds");
  }
}
