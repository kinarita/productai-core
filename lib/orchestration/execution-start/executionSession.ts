import { buildExecutionBoundaryConfirmation } from "@/lib/orchestration/execution-start/executionBoundaryConfirmation";
import type {
  ExecutionOperatorSignature,
  ExecutionSession,
} from "@/lib/orchestration/execution-start/executionStartTypes";
import type { ExecutionQueueItem } from "@/lib/orchestration/queue/executionQueueTypes";

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function nowLabel() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function createExecutionSessionStub(input: {
  item: ExecutionQueueItem;
  executionIntent: string;
  runtimeAdvisory?: string;
}): ExecutionSession {
  return {
    id: makeId("exec-session"),
    queueItemId: input.item.id,
    missionId: input.item.missionId,
    executionTarget: input.item.executionTarget,
    executionIntent: input.executionIntent,
    executionSessionStatus: "execution_start_requested",
    runtimeReservation: {
      reserved: false,
      reservationId: makeId("runtime-res"),
      note: "Mock reservation only. No runtime resource allocation executed.",
    },
    governanceBoundaryConfirmation: buildExecutionBoundaryConfirmation(
      input.item,
      input.runtimeAdvisory
    ).join(" "),
    createdAt: nowLabel(),
  };
}

export function createExecutionOperatorSignature(note?: string): ExecutionOperatorSignature {
  return {
    actor: "Alex Chen",
    role: "CEO",
    executionAuthorizationAccepted: true,
    governanceBoundaryAccepted: true,
    signedAt: new Date().toISOString(),
    operatorNote:
      note ??
      "Execution boundary was confirmed under governance review. Execution processing remains disabled.",
  };
}
