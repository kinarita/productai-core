import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { agents } from "@/data/mockData";
import { taskStoreInitial } from "@/lib/store/initialState";
import { useMissionStore } from "@/lib/store/missionStore";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import type { Agent, AgentRole, MissionHealth, OrganizationFeedItem, Task, TaskStatus } from "@/types/productai";

type TaskStatusAction = "start" | "review" | "block" | "complete";

interface TaskState {
  tasks: Task[];
  updateTaskStatus: (taskId: string, status: TaskStatus, actor?: Agent) => void;
  assignTask: (taskId: string, agentId: string) => void;
  addTask: (task: Task) => void;
  addTaskEvent: (taskId: string, message: string) => void;
  resetToInitial: () => void;
}

function nowLabel() {
  return "Just now";
}

function findAgentById(agentId: string): Agent | undefined {
  return agents.find((a) => a.id === agentId);
}

function findAgentNameByRole(role: AgentRole): string {
  return agents.find((a) => a.role === role)?.name ?? role;
}

function inferFeedType(action: TaskStatusAction): OrganizationFeedItem["type"] {
  if (action === "review") return "qa_review";
  if (action === "block") return "escalation";
  if (action === "complete") return "implementation";
  return "implementation";
}

function buildTaskEventMessage(action: TaskStatusAction, taskTitle: string) {
  if (action === "start") return `Started task: ${taskTitle}`;
  if (action === "review") return `Moved task to review: ${taskTitle}`;
  if (action === "block") return `Blocked task escalated: ${taskTitle}`;
  return `Completed task: ${taskTitle}`;
}

function statusToAction(next: TaskStatus): TaskStatusAction {
  if (next === "in_review") return "review";
  if (next === "blocked") return "block";
  if (next === "completed") return "complete";
  return "start";
}

function computeMissionHealthFromTasks(blockedCount: number, current: MissionHealth): MissionHealth {
  if (current === "blocked") return current;
  if (blockedCount >= 2) return "risky";
  if (blockedCount >= 1) return current === "risky" ? "risky" : "delayed";
  return current === "delayed" ? "stable" : current;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      ...taskStoreInitial,
      updateTaskStatus: (taskId, status, actor) => {
        const state = get();
        const existing = state.tasks.find((t) => t.id === taskId);
        if (!existing) return;

        const action = statusToAction(status);
        const event = buildTaskEventMessage(action, existing.title);
        const nextTasks = state.tasks.map((t) => {
          if (t.id !== taskId) return t;
          const nextProgress = status === "completed" ? 100 : t.progress;
          return {
            ...t,
            status,
            progress: nextProgress,
            updatedAt: nowLabel(),
            events: [...(t.events ?? []), event].slice(-12),
          };
        });

        set({ tasks: nextTasks });

        const missionId = existing.missionId;
        const missionName = existing.missionName;
        const authorRole = actor?.role ?? existing.assignedTo;
        const authorName = actor?.name ?? findAgentNameByRole(authorRole);

        // Feed event
        useOrganizationStore.getState().addFeedItem({
          type: inferFeedType(action),
          author: authorRole,
          authorName,
          agentId: actor?.id ?? existing.assignedAgentId,
          title: existing.title,
          missionId,
          missionName,
          message: event,
          requiresCeoApproval: false,
        });

        // Mission impact (lightweight)
        const mission = useMissionStore.getState().missions.find((m) => m.id === missionId);
        if (!mission) return;

        const tasksForMission = nextTasks.filter((t) => t.missionId === missionId);
        const blockedCount = tasksForMission.filter((t) => t.status === "blocked").length;
        const completedCount = tasksForMission.filter((t) => t.status === "completed").length;

        const becameCompleted = existing.status !== "completed" && status === "completed";
        const progressDelta = becameCompleted ? Math.min(6, 2 + completedCount) : 0;
        const readinessDelta = becameCompleted ? 2 : 0;
        const nextHealth = computeMissionHealthFromTasks(blockedCount, mission.health);

        // Use setState directly to avoid widening mission store API surface too much.
        useMissionStore.setState((prev) => ({
          missions: prev.missions.map((m) => {
            if (m.id !== missionId) return m;
            const nextProgress = Math.min(100, m.progress + progressDelta);
            const nextScore = Math.min(100, m.releaseReadiness.score + readinessDelta);
            return {
              ...m,
              updatedAt: nowLabel(),
              health: nextHealth,
              progress: nextProgress,
              recentActivity:
                action === "complete"
                  ? `Task completed — ${existing.title}`
                  : action === "block"
                    ? `Task blocked — ${existing.title}`
                    : action === "review"
                      ? `Review requested — ${existing.title}`
                      : `Task started — ${existing.title}`,
              releaseReadiness: {
                ...m.releaseReadiness,
                score: nextScore,
              },
            };
          }),
        }));
      },
      assignTask: (taskId, agentId) => {
        const agent = findAgentById(agentId);
        if (!agent) return;
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  assignedAgentId: agent.id,
                  assignedTo: agent.role,
                  updatedAt: nowLabel(),
                  events: [...(t.events ?? []), `Assigned to ${agent.name}`].slice(-12),
                }
              : t
          ),
        }));
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task) return;
        useOrganizationStore.getState().addFeedItem({
          type: "task_assignment",
          author: "COO",
          authorName: findAgentNameByRole("COO"),
          agentId: agent.id,
          title: task.title,
          missionId: task.missionId,
          missionName: task.missionName,
          message: `Assigned ${agent.name} to task: ${task.title}`,
          requiresCeoApproval: false,
        });
      },
      addTask: (task) =>
        set((state) => ({
          tasks: [
            { ...task, updatedAt: task.updatedAt ?? nowLabel(), events: task.events ?? [] },
            ...state.tasks,
          ],
        })),
      addTaskEvent: (taskId, message) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  updatedAt: nowLabel(),
                  events: [...(t.events ?? []), message].slice(-12),
                }
              : t
          ),
        })),
      resetToInitial: () => set({ ...taskStoreInitial }),
    }),
    {
      name: "productai-tasks",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tasks: state.tasks,
      }),
    }
  )
);

