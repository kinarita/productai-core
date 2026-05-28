import type {
  ExecutionQueueItem,
  ReservationActor,
} from "@/lib/orchestration/queue/executionQueueTypes";

export function reserveQueueItem(
  item: ExecutionQueueItem,
  reservedBy: ReservationActor
): ExecutionQueueItem {
  return {
    ...item,
    queueStatus: "reserved",
    reservedBy,
    reservedAt: new Date().toISOString(),
  };
}

export function releaseQueueReservation(item: ExecutionQueueItem): ExecutionQueueItem {
  return {
    ...item,
    queueStatus: "queued",
    reservedBy: undefined,
    reservedAt: undefined,
  };
}