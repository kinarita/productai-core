import { agents } from "@/data/mockData";
import { buildTaskProvenance } from "@/lib/orchestration/materialization/provenanceTracker";
import type { ExecutionTicket } from "@/lib/orchestration/execution/executionTypes";
import type { ExecutionPlan, ExecutionPlanItem } from "@/lib/orchestration/policy/policyTypes";
import type { ExecutionReadiness, Task, TaskEvent } from "@/types/productai";

function makeTaskId(index: number) {
  return `t-mat-${Date.now()}-${index}`;
}

function agentIdForRole(role: ExecutionPlanItem["assignedRole"]): string {
  const agent = agents.find((a) => a.role === role);
  return agent?.id ?? "eng-1";
}

function inferReadiness(
  index: number,
  total: number,
  ticket: ExecutionTicket,
  runtimeUnstable: boolean
): ExecutionReadiness {
  if (runtimeUnstable && index === 0) return "blocked";
  if (ticket.riskLevel === "high" && index < Math.ceil(total / 2)) return "governance_reviewed";
  return "execution_ready";
}

export function materializeTasksFromPlan(input: {
  plan: ExecutionPlan;
  ticket: ExecutionTicket;
  proposalId: string;
  missionName: string;
  runtimeUnstable?: boolean;
}): Task[] {
  const { plan, ticket, proposalId, missionName, runtimeUnstable = false } = input;
  const created: Task[] = [];
  let previousTaskId: string | undefined;

  plan.proposedTasks.forEach((item, index) => {
    const id = makeTaskId(index);
    const readiness = inferReadiness(index, plan.proposedTasks.length, ticket, runtimeUnstable);
    const provenance = buildTaskProvenance({
      proposalId,
      ticket,
      plan,
      readiness,
    });

    const dependencies: string[] = [];
    if (previousTaskId) dependencies.push(previousTaskId);
    if (plan.dependencyNotes.length > 0 && index === 0) {
      dependencies.push(plan.dependencyNotes[0].slice(0, 48));
    }

    const initialEvent: TaskEvent = {
      id: `te-mat-${id}`,
      type: "note",
      message:
        "Execution-ready operational task prepared under governance review. No autonomous execution triggered.",
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      actor: "COO",
      source: "system",
    };

    const task: Task = {
      id,
      title: item.title,
      missionId: plan.missionId,
      missionName,
      status: readiness === "blocked" ? "blocked" : "active",
      assignedTo: item.assignedRole,
      assignedAgentId: agentIdForRole(item.assignedRole),
      dependencies,
      eta: readiness === "execution_ready" ? "Ready" : "Pending review",
      progress: 0,
      priority: ticket.riskLevel === "high" ? "high" : "medium",
      createdFrom: "materialization",
      provenance,
      createdAt: "Just now",
      updatedAt: "Just now",
      events: [initialEvent],
    };

    created.push(task);
    previousTaskId = id;
  });

  return created;
}