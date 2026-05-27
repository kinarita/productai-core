import { agents } from "@/data/mockData";
import { useMissionStore } from "@/lib/store/missionStore";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import { useTaskStore } from "@/lib/store/taskStore";
import type { AgentRole, Decision, Task, TaskPriority } from "@/types/productai";

export interface CreateTaskFromJudgmentInput {
  title: string;
  missionId: string;
  missionName: string;
  assignedTo: AgentRole;
  priority: TaskPriority;
  note?: string;
  relatedDecisionId: string;
  decisionTitle: string;
  isFollowUp?: boolean;
  dependencyTaskIds?: string[];
}

function nowLabel() {
  return "Just now";
}

function makeTaskId() {
  return `t-${Date.now()}`;
}

export function suggestTaskTitle(decision: Decision, isFollowUp: boolean): string {
  if (isFollowUp) {
    return `Follow-up: ${decision.title}`;
  }
  const impl = decision.optionB.label;
  if (decision.title.toLowerCase().includes("partition") || impl.toLowerCase().includes("partition")) {
    return "Implement analytics partition strategy";
  }
  return `Implement ${impl.charAt(0).toLowerCase()}${impl.slice(1)}`;
}

export function suggestAssignedRole(decision: Decision): AgentRole {
  const architectHeavy = /architecture|partition|scope|api/i.test(decision.title + decision.summary);
  if (architectHeavy) return "Architect";
  if (/release|qa|e2e|test/i.test(decision.title)) return "QA";
  return "Engineer";
}

export function createTaskFromJudgment(input: CreateTaskFromJudgmentInput): string {
  const agent = agents.find((a) => a.role === input.assignedTo);
  const taskId = makeTaskId();
  const taskDeps = input.dependencyTaskIds ?? [];

  const task: Task = {
    id: taskId,
    title: input.title,
    missionId: input.missionId,
    missionName: input.missionName,
    status: "active",
    assignedTo: input.assignedTo,
    assignedAgentId: agent?.id,
    dependencies: taskDeps,
    eta: input.priority === "high" ? "2 days" : "3 days",
    progress: 0,
    priority: input.priority,
    relatedDecisionId: input.relatedDecisionId,
    createdFrom: "judgment",
    updatedAt: nowLabel(),
    createdAt: nowLabel(),
  };

  useTaskStore.getState().addTask(task);

  useTaskStore.getState().addTaskEvent(taskId, {
    type: "note",
    actor: "COO",
    agentId: agent?.id,
    message: input.isFollowUp
      ? `Follow-up task created from judgment "${input.decisionTitle}".`
      : `Implementation task created from judgment "${input.decisionTitle}".`,
    source: "judgment",
  });

  if (input.note?.trim()) {
    useTaskStore.getState().addTaskEvent(taskId, {
      type: "note",
      actor: "COO",
      message: input.note.trim(),
      source: "judgment",
    });
  }

  useOrganizationStore.getState().linkDecisionToTask(input.relatedDecisionId, taskId);

  useOrganizationStore.getState().addFeedItem({
    type: "task_creation",
    author: "COO",
    authorName: "Nova",
    missionId: input.missionId,
    missionName: input.missionName,
    taskId,
    decisionId: input.relatedDecisionId,
    title: input.title,
    message: input.isFollowUp
      ? `COO created follow-up implementation task from decision "${input.decisionTitle}".`
      : `COO created implementation task from architectural decision "${input.decisionTitle}".`,
    requiresCeoApproval: false,
  });

  useMissionStore.setState((prev) => ({
    missions: prev.missions.map((m) => {
      if (m.id !== input.missionId) return m;
      return {
        ...m,
        updatedAt: nowLabel(),
        recentActivity: `New task from judgment — ${input.title}`,
        taskIds: [...m.taskIds, taskId],
      };
    }),
  }));

  const blockedDeps = taskDeps
    .map((id) => useTaskStore.getState().tasks.find((t) => t.id === id))
    .filter((t): t is Task => Boolean(t && t.status === "blocked"));

  if (blockedDeps.length > 0) {
    useTaskStore.getState().addTaskEvent(taskId, {
      type: "note",
      actor: "COO",
      message: `Waiting on dependency: ${blockedDeps.map((d) => d.title).join(", ")}.`,
      source: "system",
    });
  }

  return taskId;
}
