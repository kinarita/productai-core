"use client";

import { actionButtonClass, findAgentByRole } from "@/lib/task/taskUi";
import { useTaskStore } from "@/lib/store/taskStore";
import type { Task, TaskStatus } from "@/types/productai";

interface TaskStatusActionsProps {
  task: Task;
  compact?: boolean;
}

export function TaskStatusActions({ task, compact }: TaskStatusActionsProps) {
  const updateTaskStatus = useTaskStore((s) => s.updateTaskStatus);
  const addTaskEvent = useTaskStore((s) => s.addTaskEvent);

  const handleStatus = (status: TaskStatus) => {
    const actor = findAgentByRole(task.assignedTo);
    updateTaskStatus(task.id, status, actor);
  };

  const handleNudge = () => {
    addTaskEvent(task.id, {
      type: "note",
      actor: task.assignedTo,
      agentId: task.assignedAgentId,
      message: `Execution note: unblocked dependencies check requested for "${task.title}".`,
      source: "tasks",
    });
  };

  const wrap = compact ? "flex flex-wrap gap-2" : "mt-4 flex flex-wrap items-center gap-2";

  return (
    <div className={wrap}>
      {task.status === "active" ? (
        <>
          <button type="button" className={actionButtonClass("secondary")} onClick={() => handleStatus("in_review")}>
            Move to Review
          </button>
          <button type="button" className={actionButtonClass("danger")} onClick={() => handleStatus("blocked")}>
            Block
          </button>
          <button type="button" className={actionButtonClass("primary")} onClick={() => handleStatus("completed")}>
            Complete
          </button>
        </>
      ) : task.status === "in_review" ? (
        <>
          <button type="button" className={actionButtonClass("secondary")} onClick={() => handleStatus("active")}>
            Back to Active
          </button>
          <button type="button" className={actionButtonClass("danger")} onClick={() => handleStatus("blocked")}>
            Block
          </button>
          <button type="button" className={actionButtonClass("primary")} onClick={() => handleStatus("completed")}>
            Complete
          </button>
        </>
      ) : task.status === "blocked" ? (
        <>
          <button type="button" className={actionButtonClass("secondary")} onClick={() => handleStatus("active")}>
            Start
          </button>
          <button type="button" className={actionButtonClass("secondary")} onClick={handleNudge}>
            Add Note
          </button>
          <button type="button" className={actionButtonClass("primary")} onClick={() => handleStatus("completed")}>
            Complete
          </button>
        </>
      ) : (
        <button type="button" className={actionButtonClass("secondary")} onClick={() => handleStatus("active")}>
          Reopen
        </button>
      )}
    </div>
  );
}
