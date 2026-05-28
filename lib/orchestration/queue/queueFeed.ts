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
    | "authorization_revoked"
    | "execute_review_requested"
    | "execute_ready_validated"
    | "execute_ready_denied"
    | "execute_ready_revoked"
    | "execution_start_requested"
    | "execution_boundary_confirmed"
    | "execution_session_started"
    | "execution_start_denied"
    | "execution_session_revoked"
    | "processing_prepared"
    | "processing_governance_activated"
    | "processing_paused"
    | "processing_revoked"
    | "processing_review_required",
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
    case "execute_review_requested":
      return `COO confirmed execution intent review${detail ? ` for ${detail}` : ""}.`;
    case "execute_ready_validated":
      return `Final governance validation completed for execution readiness${detail ? ` for ${detail}` : ""}.`;
    case "execute_ready_denied":
      return `Execute readiness was denied under governance review${detail ? ` for ${detail}` : ""}.`;
    case "execute_ready_revoked":
      return `Execute readiness was revoked pending runtime stabilization${detail ? ` for ${detail}` : ""}.`;
    case "execution_start_requested":
      return `COO requested execution session start${detail ? ` for ${detail}` : ""}.`;
    case "execution_boundary_confirmed":
      return `Execution boundary confirmation completed under governance review${detail ? ` for ${detail}` : ""}.`;
    case "execution_session_started":
      return "Execution session entered active governance state. No execution has been initiated.";
    case "execution_start_denied":
      return `Execution session start was denied under governance review${detail ? ` for ${detail}` : ""}.`;
    case "execution_session_revoked":
      return `Execution session activation was revoked pending stabilization${detail ? ` for ${detail}` : ""}.`;
    case "processing_prepared":
      return `COO prepared processing governance continuity${detail ? ` for ${detail}` : ""}.`;
    case "processing_governance_activated":
      return "Processing governance entered active continuity state. No operational execution has been initiated.";
    case "processing_paused":
      return `Runtime Observer recommended processing pause${detail ? ` for ${detail}` : ""}.`;
    case "processing_revoked":
      return `Processing governance was revoked under review${detail ? ` for ${detail}` : ""}.`;
    case "processing_review_required":
      return "Processing review was requested pending runtime stabilization.";
    default:
      return "Queue governance event recorded.";
  }
}