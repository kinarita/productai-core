import { buildReplayMetadata } from "@/lib/replay-query/replayMetadata";

export type QueueFeedAction =
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
    | "processing_review_required"
    | "processing_review_resolved"
    | "processing_review_denied"
    | "processing_review_revoked"
    | "processing_governance_reason_added"
    | "processing_governance_summary"
    | "continuity_advisory"
    | "runtime_governance_summary";

export function queueFeedMessage(action: QueueFeedAction, detail?: string): string {
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
      return `Processing governance was paused pending dependency review${detail ? ` for ${detail}` : ""}.`;
    case "processing_revoked":
      return `Processing governance was revoked under review${detail ? ` for ${detail}` : ""}.`;
    case "processing_review_required":
      return "Processing governance review has been requested under operational continuity policy.";
    case "processing_review_resolved":
      return `COO resumed processing governance continuity${detail ? ` for ${detail}` : ""}.`;
    case "processing_review_denied":
      return `Processing governance review concluded with denial${detail ? ` for ${detail}` : ""}.`;
    case "processing_review_revoked":
      return `Processing governance was revoked after review${detail ? ` for ${detail}` : ""}.`;
    case "processing_governance_reason_added":
      return `Runtime Observer requested processing governance review${detail ? ` — ${detail}` : ""}.`;
    case "processing_governance_summary":
      return `COO escalated governance review visibility for operational continuity${detail ? ` — ${detail}` : ""}.`;
    case "continuity_advisory":
      return "Governance continuity remains stable under elevated advisory review density.";
    case "runtime_governance_summary":
      return "Runtime Observer reported increased provider instability review load.";
    default:
      return "Queue governance event recorded.";
  }
}

export function queueFeedMetadata(action: QueueFeedAction): {
  governanceCategory:
    | "governance_summary"
    | "governance_review"
    | "governance_continuity"
    | "governance_runtime"
    | "governance_processing"
    | "governance_replay";
  replayCategory:
    | "replay_summary"
    | "replay_memory"
    | "replay_review"
    | "replay_runtime"
    | "replay_governance"
    | "replay_advisory"
    | "replay_timeline";
  continuityCategory:
    | "continuity_stable"
    | "continuity_review"
    | "continuity_advisory"
    | "continuity_runtime"
    | "continuity_governance"
    | "continuity_replay";
  advisoryLevel: "advisory_low" | "advisory_moderate" | "advisory_elevated";
  replayTags: string[];
  replaySeverity: "low" | "moderate" | "elevated" | "critical_review";
  replaySource: "runtime_observer" | "coo" | "ceo" | "system";
} {
  if (action === "runtime_governance_summary" || action === "runtime_lock") {
    return buildReplayMetadata({
      governanceCategory: "governance_runtime",
      replayCategory: "replay_runtime",
      continuityCategory: "continuity_runtime",
      advisoryLevel: "advisory_elevated",
      replayTags: ["runtime", "advisory", "continuity"],
      replaySeverity: "elevated",
      replaySource: "runtime_observer",
    });
  }
  if (action.includes("review")) {
    return buildReplayMetadata({
      governanceCategory: "governance_review",
      replayCategory: "replay_review",
      continuityCategory:
        action === "processing_review_required" ? "continuity_review" : "continuity_governance",
      advisoryLevel: "advisory_moderate",
      replayTags: ["review", "governance"],
      replaySeverity:
        action === "processing_review_denied" || action === "processing_review_revoked"
          ? "critical_review"
          : "moderate",
      replaySource: action.includes("denied") || action.includes("revoked") ? "ceo" : "coo",
    });
  }
  if (action.includes("summary") || action.includes("continuity")) {
    return buildReplayMetadata({
      governanceCategory: "governance_summary",
      replayCategory: "replay_summary",
      continuityCategory: "continuity_stable",
      advisoryLevel: "advisory_low",
      replayTags: ["summary", "replay"],
      replaySeverity: "low",
      replaySource: "coo",
    });
  }
  return buildReplayMetadata({
    governanceCategory: "governance_processing",
    replayCategory: "replay_timeline",
    continuityCategory: "continuity_stable",
    advisoryLevel: "advisory_low",
    replayTags: ["processing", "timeline"],
    replaySeverity: "low",
    replaySource: "coo",
  });
}