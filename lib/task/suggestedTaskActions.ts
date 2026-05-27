import { useMissionStore } from "@/lib/store/missionStore";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { agentName } from "@/lib/task/taskUi";
import { getBlockedDependencies, isWaitingOnDependency } from "@/lib/task/taskDependencies";
import type { Task, TaskStatus } from "@/types/productai";

export type SuggestedActionKey =
  | "escalate_coo"
  | "request_arch_review"
  | "add_execution_note"
  | "request_qa_validation"
  | "link_evidence"
  | "update_mission_status"
  | "record_learning"
  | "clarify_next_step"
  | "move_to_review_when_ready"
  | "resolve_dependency_blocker";

export interface SuggestedActionItem {
  key: SuggestedActionKey;
  title: string;
  description: string;
}

export function getSuggestedActionsForTask(task: Task, allTasks: Task[]): SuggestedActionItem[] {
  const base = getSuggestedActionsForStatus(task.status);
  if (!isWaitingOnDependency(task, allTasks)) return base;
  const blocked = getBlockedDependencies(task, allTasks);
  const depLabel = blocked.map((d) => d.title).join(", ");
  return [
    {
      key: "resolve_dependency_blocker",
      title: "Resolve dependency blocker",
      description: `Unblock or escalate: ${depLabel}.`,
    },
    ...base,
  ];
}

export function getSuggestedActionsForStatus(status: TaskStatus): SuggestedActionItem[] {
  if (status === "blocked") {
    return [
      {
        key: "escalate_coo",
        title: "Escalate to COO",
        description: "Clarify owner and unblock dependencies.",
      },
      {
        key: "request_arch_review",
        title: "Request architectural review",
        description: "Align on constraints before resuming.",
      },
      {
        key: "add_execution_note",
        title: "Add execution note",
        description: "Capture what is currently blocking progress.",
      },
    ];
  }
  if (status === "in_review") {
    return [
      {
        key: "request_qa_validation",
        title: "Request QA validation",
        description: "Confirm acceptance criteria and edge cases.",
      },
      {
        key: "link_evidence",
        title: "Link implementation evidence",
        description: "Attach a short note describing what changed and what to verify.",
      },
    ];
  }
  if (status === "completed") {
    return [
      {
        key: "update_mission_status",
        title: "Update mission status",
        description: "Confirm mission progress is reflected.",
      },
      {
        key: "record_learning",
        title: "Record implementation learning",
        description: "Capture a pattern for the organization memory stream.",
      },
    ];
  }
  return [
    {
      key: "clarify_next_step",
      title: "Clarify next step",
      description: "Add a concrete execution note and expected outcome.",
    },
    {
      key: "move_to_review_when_ready",
      title: "Move to review when ready",
      description: "Shift into validation once work is done.",
    },
  ];
}

function touchMissionActivity(missionId: string, recentActivity: string) {
  useMissionStore.setState((prev) => ({
    missions: prev.missions.map((m) =>
      m.id === missionId ? { ...m, recentActivity, updatedAt: "Just now" } : m
    ),
  }));
}

export function executeSuggestedAction(task: Task, key: SuggestedActionKey) {
  const addFeedItem = useOrganizationStore.getState().addFeedItem;
  const addTaskEvent = useTaskStore.getState().addTaskEvent;
  const updateTaskStatus = useTaskStore.getState().updateTaskStatus;

  switch (key) {
    case "escalate_coo":
      addFeedItem({
        type: "escalation",
        author: "COO",
        authorName: "Nova",
        missionId: task.missionId,
        missionName: task.missionName,
        taskId: task.id,
        status: "blocked",
        title: task.title,
        message: `COO escalated blocked task "${task.title}" — coordination required.`,
        requiresCeoApproval: false,
      });
      addTaskEvent(task.id, {
        type: "note",
        actor: "COO",
        message: "Escalated to COO for dependency resolution.",
        source: "tasks",
      });
      break;

    case "request_arch_review":
      addFeedItem({
        type: "architecture",
        author: "Architect",
        authorName: "Sage",
        missionId: task.missionId,
        missionName: task.missionName,
        taskId: task.id,
        status: task.status,
        title: task.title,
        message: `Architect review requested for "${task.title}".`,
        requiresCeoApproval: false,
      });
      addTaskEvent(task.id, {
        type: "note",
        actor: "Architect",
        message: "Architectural review requested before resuming execution.",
        source: "tasks",
      });
      break;

    case "add_execution_note":
      addTaskEvent(task.id, {
        type: "note",
        actor: task.assignedTo,
        agentId: task.assignedAgentId,
        message: `Execution note: dependencies and blockers documented for "${task.title}".`,
        source: "tasks",
      });
      break;

    case "request_qa_validation":
      addFeedItem({
        type: "qa_review",
        author: "QA",
        authorName: "Lens",
        missionId: task.missionId,
        missionName: task.missionName,
        taskId: task.id,
        status: "in_review",
        title: task.title,
        message: `QA validation requested for "${task.title}".`,
        requiresCeoApproval: false,
      });
      addTaskEvent(task.id, {
        type: "note",
        actor: "QA",
        message: "QA validation requested — acceptance criteria check in progress.",
        source: "tasks",
      });
      break;

    case "link_evidence":
      addFeedItem({
        type: "implementation",
        author: task.assignedTo,
        authorName: agentName(task.assignedTo),
        missionId: task.missionId,
        missionName: task.missionName,
        taskId: task.id,
        status: "completed",
        title: task.title,
        message: `Implementation evidence linked for "${task.title}" — ready for review validation.`,
        requiresCeoApproval: false,
      });
      addTaskEvent(task.id, {
        type: "note",
        actor: task.assignedTo,
        message: "Implementation evidence linked for review.",
        source: "tasks",
      });
      break;

    case "update_mission_status":
      touchMissionActivity(
        task.missionId,
        `Mission progress updated after task completion — ${task.title}.`
      );
      addTaskEvent(task.id, {
        type: "note",
        actor: "COO",
        message: "Mission status acknowledged following task completion.",
        source: "mission",
      });
      break;

    case "record_learning":
      addFeedItem({
        type: "memory",
        author: "Architect",
        authorName: "Sage",
        missionId: task.missionId,
        missionName: task.missionName,
        taskId: task.id,
        status: "completed",
        title: `Learning: ${task.title}`,
        message: `Implementation learning recorded from "${task.title}" — added to organizational memory stream.`,
        requiresCeoApproval: false,
      });
      touchMissionActivity(
        task.missionId,
        `Organizational learning captured from completed task — ${task.title}.`
      );
      addTaskEvent(task.id, {
        type: "note",
        actor: "Architect",
        message: "Implementation learning recorded for organizational memory.",
        source: "mission",
      });
      break;

    case "clarify_next_step":
      addTaskEvent(task.id, {
        type: "note",
        actor: task.assignedTo,
        agentId: task.assignedAgentId,
        message: `Next step clarified: continue execution on "${task.title}".`,
        source: "tasks",
      });
      break;

    case "move_to_review_when_ready":
      updateTaskStatus(task.id, "in_review");
      break;

    case "resolve_dependency_blocker": {
      const blocked = getBlockedDependencies(
        task,
        useTaskStore.getState().tasks
      );
      const first = blocked[0];
      if (first) {
        addFeedItem({
          type: "escalation",
          author: "COO",
          authorName: "Nova",
          missionId: task.missionId,
          missionName: task.missionName,
          taskId: task.id,
          status: "blocked",
          title: task.title,
          message: `Dependency escalation: "${task.title}" waiting on blocked task "${first.title}".`,
          requiresCeoApproval: false,
        });
        addTaskEvent(task.id, {
          type: "note",
          actor: "COO",
          message: `Escalated dependency blocker — waiting on "${first.title}".`,
          source: "system",
        });
        touchMissionActivity(
          task.missionId,
          `Dependency blocker escalated — ${first.title} blocking ${task.title}.`
        );
      }
      break;
    }
  }
}
