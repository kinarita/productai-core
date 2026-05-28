export function queueFeedMessage(
  action:
    | "slot_reserved"
    | "reservation_released"
    | "queued"
    | "worker_prepared"
    | "awaiting_authorization"
    | "runtime_lock",
  detail?: string
): string {
  switch (action) {
    case "slot_reserved":
      return `COO reserved execution preparation slot${detail ? ` for ${detail}` : ""}.`;
    case "reservation_released":
      return `Execution preparation reservation released${detail ? ` for ${detail}` : ""}.`;
    case "queued":
      return `Operational task entered controlled execution queue${detail ? `: ${detail}` : ""}.`;
    case "worker_prepared":
      return `Worker preparation completed under governance review${detail ? ` — ${detail}` : ""}.`;
    case "awaiting_authorization":
      return `Execution preparation awaiting human authorization${detail ? ` for ${detail}` : ""}. No execution was initiated.`;
    case "runtime_lock":
      return `Runtime Observer paused queue progression due to sync degradation${detail ? ` — ${detail}` : ""}. Recommendation only.`;
    default:
      return "Queue governance event recorded.";
  }
}