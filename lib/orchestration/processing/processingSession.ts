import { processingSemanticsMessage } from "@/lib/orchestration/processing/processingBoundary";
import type { ProcessingSession } from "@/lib/orchestration/processing/processingTypes";
import type { ExecutionSession } from "@/lib/orchestration/execution-start/executionStartTypes";
import type { ExecutionQueueItem } from "@/lib/orchestration/queue/executionQueueTypes";

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function nowLabel() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function createProcessingSession(input: {
  executionSession: ExecutionSession;
  item: ExecutionQueueItem;
  intent: string;
  advisoryState: string;
}): ProcessingSession {
  return {
    id: makeId("processing-session"),
    executionSessionId: input.executionSession.id,
    queueItemId: input.item.id,
    missionId: input.item.missionId,
    processingIntent: input.intent,
    processingTarget: input.item.executionTarget,
    processingStatus: "processing_prepared",
    runtimeReservation: {
      reserved: true,
      reservationId: makeId("processing-runtime"),
      note: "Mock runtime continuity reservation only. No resource allocation executed.",
    },
    governanceContinuity: processingSemanticsMessage(),
    advisoryState: input.advisoryState,
    createdAt: nowLabel(),
  };
}
