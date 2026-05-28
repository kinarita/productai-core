import type { ExecutionPlan } from "@/lib/orchestration/policy/policyTypes";
import type { ExecutionTicket } from "@/lib/orchestration/execution/executionTypes";
import type { ExecutionReadiness, Task, TaskProvenance } from "@/types/productai";

export function buildTaskProvenance(input: {
  proposalId: string;
  ticket: ExecutionTicket;
  plan: ExecutionPlan;
  readiness: ExecutionReadiness;
}): TaskProvenance {
  const { proposalId, ticket, plan, readiness } = input;
  return {
    createdFromProposalId: proposalId,
    createdFromExecutionTicketId: ticket.id,
    createdFromExecutionPlanId: plan.id,
    governanceApprovedBy: ticket.approvalSignature?.actor ?? ticket.approvedBy,
    materializedAt: new Date().toISOString(),
    executionReadiness: readiness,
    governanceNotes: [
      plan.governanceNote,
      ...(plan.reviewRequirements.length ? [plan.reviewRequirements[0]] : []),
    ],
    executionBoundaryNote:
      "Operational task only — no autonomous execution. Human authorization required for any future execution boundary crossing.",
  };
}

export function getTasksByTicketId(tasks: Task[], ticketId: string): Task[] {
  return tasks.filter((t) => t.provenance?.createdFromExecutionTicketId === ticketId);
}

export function getTasksByProposalId(tasks: Task[], proposalId: string): Task[] {
  return tasks.filter((t) => t.provenance?.createdFromProposalId === proposalId);
}

export function countReadiness(tasks: Task[], missionId: string) {
  const missionTasks = tasks.filter(
    (t) => t.missionId === missionId && t.createdFrom === "materialization"
  );
  return {
    governanceReviewed: missionTasks.filter(
      (t) => t.provenance?.executionReadiness === "governance_reviewed"
    ).length,
    executionReady: missionTasks.filter(
      (t) => t.provenance?.executionReadiness === "execution_ready"
    ).length,
    blocked: missionTasks.filter((t) => t.provenance?.executionReadiness === "blocked").length,
    planning: missionTasks.filter((t) => t.provenance?.executionReadiness === "planning").length,
  };
}