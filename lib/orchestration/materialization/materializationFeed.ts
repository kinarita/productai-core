export function materializationFeedMessage(
  action:
    | "materialization_requested"
    | "tasks_materialized"
    | "governance_review_completed"
    | "runtime_readiness_advisory",
  detail?: string
): string {
  switch (action) {
    case "materialization_requested":
      return `Governance review requested for execution materialization${detail ? `: ${detail}` : ""}.`;
    case "tasks_materialized":
      return `COO materialized execution plan into operational tasks${detail ? ` — ${detail}` : ""}.`;
    case "governance_review_completed":
      return `Governance review completed for execution readiness${detail ? `: ${detail}` : ""}.`;
    case "runtime_readiness_advisory":
      return `Runtime Observer flagged readiness instability${detail ? ` — ${detail}` : ""}. Review recommended before boundary authorization.`;
    default:
      return "Materialization governance event recorded.";
  }
}