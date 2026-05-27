"use client";

import { useState } from "react";
import Link from "next/link";
import {
  createTaskFromJudgment,
  suggestAssignedRole,
  suggestTaskTitle,
} from "@/lib/task/createTaskFromJudgment";
import type { AgentRole, Decision, TaskPriority } from "@/types/productai";

const roles: AgentRole[] = ["COO", "Architect", "Engineer", "QA"];
const priorities: TaskPriority[] = ["high", "medium", "low"];

interface CreateTaskFromDecisionFormProps {
  decision: Decision;
  isFollowUp?: boolean;
  onCreated?: (taskId: string) => void;
  onCancel?: () => void;
}

export function CreateTaskFromDecisionForm({
  decision,
  isFollowUp,
  onCreated,
  onCancel,
}: CreateTaskFromDecisionFormProps) {
  const [title, setTitle] = useState(() => suggestTaskTitle(decision, Boolean(isFollowUp)));
  const [assignedTo, setAssignedTo] = useState<AgentRole>(() => suggestAssignedRole(decision));
  const [priority, setPriority] = useState<TaskPriority>(decision.priority);
  const [note, setNote] = useState("");
  const [createdTaskId, setCreatedTaskId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    const taskId = createTaskFromJudgment({
      title: trimmed,
      missionId: decision.relatedMissionId,
      missionName: decision.missionName,
      assignedTo,
      priority,
      note: note.trim() || undefined,
      relatedDecisionId: decision.id,
      decisionTitle: decision.title,
      isFollowUp,
      dependencyTaskIds: isFollowUp ? decision.relatedTaskIds : undefined,
    });

    setCreatedTaskId(taskId);
    onCreated?.(taskId);
  };

  if (createdTaskId) {
    return (
      <div className="mt-4 rounded-lg border border-border bg-surface p-4">
        <p className="text-sm text-foreground">Task created and linked to this decision.</p>
        <Link
          href={`/tasks/${createdTaskId}`}
          className="mt-2 inline-block text-xs font-medium text-accent hover:underline"
        >
          Open execution console →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-lg border border-border bg-surface p-4">
      <p className="text-xs font-medium uppercase text-muted">
        {isFollowUp ? "Create follow-up task" : "Create implementation task"}
      </p>
      <div className="mt-3 space-y-3">
        <div>
          <label className="text-xs text-muted" htmlFor={`title-${decision.id}-${isFollowUp ? "fu" : "c"}`}>
            Title
          </label>
          <input
            id={`title-${decision.id}-${isFollowUp ? "fu" : "c"}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-muted" htmlFor={`role-${decision.id}`}>
              Assigned AI role
            </label>
            <select
              id={`role-${decision.id}`}
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value as AgentRole)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted" htmlFor={`priority-${decision.id}`}>
              Priority
            </label>
            <select
              id={`priority-${decision.id}`}
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs text-muted" htmlFor={`note-${decision.id}`}>
            Note (optional)
          </label>
          <textarea
            id={`note-${decision.id}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="Context from judgment for the execution team…"
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="submit"
          className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
        >
          {isFollowUp ? "Create follow-up task" : "Create task"}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
