export function queueFeedMessage(
  action:
    | "slot_reserved"
    | "reservation_released"
    | "queued"
    | "worker_prepared"
    | "awaiting_authorization"
    | "runtime_lock"
    | "authorization_requested"
    | "authorization_granted"
    | "authorization_denied"
    | "authorization_revoked",
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
    case "authorization_requested":
      return `COO requested execution authorization${detail ? ` for ${detail}` : ""}.`;
    case "authorization_granted":
      return `CEO authorized execution boundary review${detail ? ` for ${detail}` : ""}.`;
    case "authorization_denied":
      return `Execution authorization was denied under governance review${detail ? ` for ${detail}` : ""}.`;
    case "authorization_revoked":
      return `Execution authorization was revoked under governance review${detail ? ` for ${detail}` : ""}.`;
    default:
      return "Queue governance event recorded.";
  }
}