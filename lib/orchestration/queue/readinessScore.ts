import type { ExecutionTicket } from "@/lib/orchestration/execution/executionTypes";
import type { Task } from "@/types/productai";

export interface ReadinessScoreResult {
  score: number;
  factors: { label: string; met: boolean; weight: number }[];
}

export function computeReadinessScore(input: {
  task: Task;
  ticket?: ExecutionTicket;
  syncWarningCount?: number;
  runtimeAlertCount?: number;
  providerDegraded?: boolean;
}): ReadinessScoreResult {
  const factors = [
    {
      label: "Governance approved",
      met: Boolean(input.task.provenance?.governanceApprovedBy && input.ticket?.approvalSignature),
      weight: 25,
    },
    {
      label: "Runtime stable",
      met: (input.runtimeAlertCount ?? 0) === 0 && !input.providerDegraded,
      weight: 20,
    },
    {
      label: "Dependency stable",
      met: input.task.status !== "blocked",
      weight: 20,
    },
    {
      label: "Sync healthy",
      met: (input.syncWarningCount ?? 0) < 2,
      weight: 20,
    },
    {
      label: "Provenance complete",
      met: Boolean(
        input.task.provenance?.createdFromProposalId &&
          input.task.provenance?.createdFromExecutionTicketId
      ),
      weight: 15,
    },
  ];

  const score = Math.min(
    100,
    factors.reduce((sum, f) => sum + (f.met ? f.weight : 0), 0)
  );

  return { score, factors };
}