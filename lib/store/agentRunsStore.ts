"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  agentRunKey,
  createAuditId,
  type AgentAuditRecord,
  type AgentId,
  type AgentRun,
} from "@/lib/agents/audit/agentAuditTypes";
import {
  getAgentAuditTrail,
  getLatestAgentRun,
  getMissionAuditTrail,
} from "@/lib/agents/audit/agentAuditSelectors";
import { toPlannerAgentRun } from "@/lib/agents/audit/plannerRunAdapter";
import { formatProductBriefMarkdown } from "@/lib/agents/planner/formatProductBrief";
import { plannerPromptHashAsync } from "@/lib/agents/planner/plannerPromptHash";
import type {
  PlannerAgentRun,
  PlannerGenerationResult,
  PlannerRunStatus,
  ProductBriefSections,
} from "@/lib/agents/planner/plannerTypes";
import { PLANNER_PROMPT_VERSION } from "@/lib/agents/planner/plannerTypes";
import type { ProjectActivityItem, ProjectCreationInput } from "@/lib/project-creation/projectCreationTypes";
import { useMissionStore } from "@/lib/store/missionStore";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import { useProjectCreationStore } from "@/lib/store/projectCreationStore";

const LEGACY_PLANNER_STORAGE_KEY = "productai-planner-agent";
const MAX_AUDIT_TRAIL = 500;

const plannerGenerationInFlight = new Set<string>();

function activityId(): string {
  return `act-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
}

function nowLabel(): string {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function projectNameFromIdea(idea: string): string {
  const firstLine = idea.split("\n")[0]?.trim() ?? idea.trim();
  if (firstLine.length <= 48) return firstLine;
  return `${firstLine.slice(0, 45)}…`;
}

function applyBriefToMission(missionId: string, projectName: string, brief: ProductBriefSections) {
  const markdown = formatProductBriefMarkdown(projectName, brief);
  useMissionStore.setState((state) => ({
    missions: state.missions.map((m) =>
      m.id === missionId
        ? {
            ...m,
            requirementsSummary: markdown,
            summary: `Planning complete — Product Brief ready for ${projectName}.`,
            recentActivity: "Product Planner generated Product Brief",
            progress: Math.max(m.progress, 28),
            updatedAt: "Just now",
          }
        : m
    ),
  }));
}

interface AgentRunsState {
  runs: Record<string, AgentRun>;
  auditTrail: AgentAuditRecord[];

  getMissionAuditTrail: (missionId: string) => AgentAuditRecord[];
  getAgentAuditTrail: (missionId: string, agentId: AgentId) => AgentAuditRecord[];
  getLatestAgentRun: (missionId: string, agentId: AgentId) => AgentRun | undefined;

  appendAudit: (record: AgentAuditRecord) => void;
  mergeLegacyPlannerRuns: (legacyRuns: Record<string, unknown>) => void;

  getPlannerRun: (missionId: string) => PlannerAgentRun | undefined;
  initPlannerRun: (missionId: string, input: ProjectCreationInput) => void;
  setPlannerStatus: (missionId: string, status: PlannerRunStatus, errorMessage?: string) => void;
  appendPlannerActivity: (missionId: string, message: string) => void;
  generatePlannerForMission: (missionId: string) => Promise<void>;
  retryPlannerGeneration: (missionId: string) => Promise<void>;
}

function isLegacyPlannerRun(value: unknown): value is {
  missionId?: string;
  status: PlannerRunStatus;
  input: ProjectCreationInput;
  reasoning: string[];
  analysis?: string;
  decisions?: string[];
  brief?: ProductBriefSections;
  audit?: AgentAuditRecord;
  errorMessage?: string;
} {
  return (
    !!value &&
    typeof value === "object" &&
    "input" in value &&
    "status" in value &&
    !("agentId" in value)
  );
}

export const useAgentRunsStore = create<AgentRunsState>()(
  persist(
    (set, get) => ({
      runs: {},
      auditTrail: [],

      getMissionAuditTrail: (missionId) => getMissionAuditTrail(get().auditTrail, missionId),

      getAgentAuditTrail: (missionId, agentId) =>
        getAgentAuditTrail(get().auditTrail, missionId, agentId),

      getLatestAgentRun: (missionId, agentId) =>
        getLatestAgentRun(get().runs, missionId, agentId),

      appendAudit: (record) =>
        set((state) => ({
          auditTrail: [...state.auditTrail, record].slice(-MAX_AUDIT_TRAIL),
        })),

      mergeLegacyPlannerRuns: (legacyRuns) => {
        if (!legacyRuns || typeof legacyRuns !== "object") return;

        const nextRuns = { ...get().runs };
        const auditsToAppend: AgentAuditRecord[] = [];

        for (const [key, raw] of Object.entries(legacyRuns)) {
          if (!isLegacyPlannerRun(raw)) continue;
          const missionId = raw.missionId ?? key;
          const runKey = agentRunKey(missionId, "product_planner");
          if (nextRuns[runKey]) continue;

          const audit = raw.audit
            ? {
                ...raw.audit,
                id: raw.audit.id ?? createAuditId(),
                missionId: raw.audit.missionId ?? missionId,
                agentId: "product_planner" as const,
                status: raw.audit.status ?? ("success" as const),
              }
            : undefined;

          nextRuns[runKey] = {
            missionId,
            agentId: "product_planner",
            status: raw.status,
            input: raw.input,
            reasoning: raw.reasoning ?? [],
            audit,
            errorMessage: raw.errorMessage,
          };

          if (audit) auditsToAppend.push(audit);
        }

        if (
          Object.keys(nextRuns).length === Object.keys(get().runs).length &&
          auditsToAppend.length === 0
        ) {
          return;
        }

        set((state) => ({
          runs: { ...state.runs, ...nextRuns },
          auditTrail: [...state.auditTrail, ...auditsToAppend].slice(-MAX_AUDIT_TRAIL),
        }));
      },

      getPlannerRun: (missionId) => {
        const run = get().runs[agentRunKey(missionId, "product_planner")] as
          | AgentRun<ProjectCreationInput, PlannerGenerationResult>
          | undefined;
        return toPlannerAgentRun(run);
      },

      initPlannerRun: (missionId, input) => {
        const key = agentRunKey(missionId, "product_planner");
        set((state) => ({
          runs: {
            ...state.runs,
            [key]: {
              missionId,
              agentId: "product_planner",
              status: "idle",
              input,
              reasoning: [],
            },
          },
        }));
      },

      setPlannerStatus: (missionId, status, errorMessage) =>
        set((state) => {
          const key = agentRunKey(missionId, "product_planner");
          const run = state.runs[key];
          if (!run) return state;
          return {
            runs: {
              ...state.runs,
              [key]: { ...run, status, errorMessage },
            },
          };
        }),

      appendPlannerActivity: (missionId, message) => {
        const item: ProjectActivityItem = {
          id: activityId(),
          missionId,
          workerEmoji: "🧠",
          workerName: "Product Planner",
          message,
          timestamp: nowLabel(),
        };
        useProjectCreationStore.setState((state) => ({
          activities: [item, ...state.activities].slice(0, 120),
        }));
      },

      generatePlannerForMission: async (missionId) => {
        const key = agentRunKey(missionId, "product_planner");
        const run = get().runs[key] as AgentRun<
          ProjectCreationInput,
          PlannerGenerationResult
        > | undefined;
        if (!run || run.status === "working" || run.status === "completed") return;
        if (plannerGenerationInFlight.has(missionId)) return;

        plannerGenerationInFlight.add(missionId);
        const projectName = projectNameFromIdea(run.input.idea);
        get().setPlannerStatus(missionId, "working");
        get().appendPlannerActivity(missionId, "Planner started analysis");

        const providerInput = {
          ...run.input,
          projectName,
          missionId,
        };

        try {
          const response = await fetch("/api/agents/planner/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(providerInput),
          });

          const data = (await response.json()) as {
            output?: PlannerGenerationResult;
            audit?: AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult>;
            error?: string;
          };

          if (!response.ok || data.error || !data.output) {
            const message = data.error ?? "Unable to generate Product Brief";
            const promptHash = await plannerPromptHashAsync(providerInput);
            const failureAudit: AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult> =
              data.audit
                ? { ...data.audit, status: "failed", errorMessage: message, output: undefined }
                : {
                    id: createAuditId(),
                    missionId,
                    agentId: "product_planner",
                    timestamp: new Date().toISOString(),
                    providerId: "unknown",
                    model: "unknown",
                    promptVersion: PLANNER_PROMPT_VERSION,
                    promptHash,
                    input: run.input,
                    reasoning: run.reasoning,
                    status: "failed",
                    errorMessage: message,
                  };

            get().appendAudit(failureAudit);
            set((state) => ({
              runs: {
                ...state.runs,
                [key]: {
                  ...run,
                  status: "failed",
                  audit: failureAudit,
                  errorMessage: message,
                },
              },
            }));
            get().appendPlannerActivity(missionId, "Planning failed — retry available");
            return;
          }

          const output = data.output;
          const audit: AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult> = data.audit
            ? { ...data.audit, status: "success", output }
            : {
                id: createAuditId(),
                missionId,
                agentId: "product_planner",
                timestamp: new Date().toISOString(),
                providerId: "unknown",
                model: "unknown",
                promptVersion: PLANNER_PROMPT_VERSION,
                input: run.input,
                analysis: output.analysis,
                decisions: output.decisions,
                reasoning: output.reasoning,
                output,
                status: "success",
              };

          get().appendAudit(audit);
          get().appendPlannerActivity(missionId, "Planner identified target users");
          get().appendPlannerActivity(missionId, "Planner generated Product Brief");
          get().appendPlannerActivity(missionId, "Planning completed");

          set((state) => ({
            runs: {
              ...state.runs,
              [key]: {
                ...run,
                status: "completed",
                reasoning: output.reasoning,
                audit,
                errorMessage: undefined,
              },
            },
          }));

          applyBriefToMission(missionId, projectName, output.brief);

          useProjectCreationStore.setState((state) => ({
            projects: state.projects.map((p) =>
              p.missionId === missionId
                ? { ...p, plannerStatus: "planning_started", productBriefGenerated: true }
                : p
            ),
          }));

          const mission = useMissionStore.getState().missions.find((m) => m.id === missionId);
          if (mission) {
            useOrganizationStore.getState().addFeedItemWithSync({
              type: "coordination",
              author: "COO",
              authorName: "Nova",
              missionId,
              missionName: mission.name,
              message: `Product Planner completed the Product Brief for "${mission.name}" — review reasoning on the project page.`,
              status: "active",
              requiresCeoApproval: false,
            });
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unable to generate Product Brief";
          const promptHash = await plannerPromptHashAsync(providerInput);
          const failureAudit: AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult> = {
            id: createAuditId(),
            missionId,
            agentId: "product_planner",
            timestamp: new Date().toISOString(),
            providerId: "unknown",
            model: "unknown",
            promptVersion: PLANNER_PROMPT_VERSION,
            promptHash,
            input: run.input,
            reasoning: run.reasoning,
            status: "failed",
            errorMessage: message,
          };

          get().appendAudit(failureAudit);
          set((state) => ({
            runs: {
              ...state.runs,
              [key]: {
                ...run,
                status: "failed",
                audit: failureAudit,
                errorMessage: message,
              },
            },
          }));
          get().appendPlannerActivity(missionId, "Planning failed — retry available");
        } finally {
          plannerGenerationInFlight.delete(missionId);
        }
      },

      retryPlannerGeneration: async (missionId) => {
        const key = agentRunKey(missionId, "product_planner");
        const run = get().runs[key];
        if (!run) return;
        set((state) => ({
          runs: {
            ...state.runs,
            [key]: { ...run, status: "idle", errorMessage: undefined },
          },
        }));
        await get().generatePlannerForMission(missionId);
      },
    }),
    {
      name: "productai-agent-runs",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        runs: state.runs,
        auditTrail: state.auditTrail,
      }),
      onRehydrateStorage: () => (state) => {
        if (typeof window === "undefined" || !state) return;
        try {
          const raw = localStorage.getItem(LEGACY_PLANNER_STORAGE_KEY);
          if (!raw) return;
          const parsed = JSON.parse(raw) as { state?: { runs?: Record<string, unknown> } };
          state.mergeLegacyPlannerRuns(parsed.state?.runs ?? {});
          localStorage.removeItem(LEGACY_PLANNER_STORAGE_KEY);
        } catch {
          /* ignore corrupt legacy storage */
        }
      },
    }
  )
);
