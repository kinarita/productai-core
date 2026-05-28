import type {
  ExecutionAuthorizationRequest,
  ExecutionAuthorizationSignature,
} from "@/lib/orchestration/authorization/authorizationTypes";
import type { ExecutionQueueItem } from "@/lib/orchestration/queue/executionQueueTypes";

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function nowLabel() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function buildExecutionAuthorizationRequest(input: {
  item: ExecutionQueueItem;
  missionId: string;
  requestedBy?: "COO" | "Runtime Observer" | "Human Operator";
  authorizationIntent: string;
  runtimeRisk: string;
}): ExecutionAuthorizationRequest {
  return {
    id: makeId("auth-req"),
    queueItemId: input.item.id,
    missionId: input.missionId,
    requestedBy: input.requestedBy ?? "COO",
    authorizationIntent: input.authorizationIntent,
    executionTarget: input.item.executionTarget,
    governanceSummary: input.item.governanceBoundary,
    readinessScore: input.item.readinessScore,
    runtimeRisk: input.runtimeRisk,
    status: "authorization_requested",
    createdAt: nowLabel(),
  };
}

export function createExecutionAuthorizationSignature(note?: string): ExecutionAuthorizationSignature {
  return {
    actor: "Alex Chen",
    role: "CEO",
    authorizationType: "execution_authorization",
    authorizedAt: new Date().toISOString(),
    authorizationNote:
      note ??
      "Execution authorization accepted under governance review. This does not start execution automatically.",
    governanceBoundaryAccepted: true,
  };
}
