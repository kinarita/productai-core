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
import {
  countQuestionsAskedForRun,
  MAX_CLARIFICATION_ROUNDS,
} from "@/lib/agents/planner/plannerClarification";
import type { CustomerProblemFitReport } from "@/lib/cpf/cpfTypes";
import type { ProblemSolutionFitReport } from "@/lib/psf/psfTypes";
import type { OpportunityBrief } from "@/lib/opportunity/opportunityTypes";
import {
  computePmfReadinessFromSignals,
  inferCurrentPmfStage,
} from "@/lib/pmf/pmfJourney";
import type { PmfReadiness, PmfStage } from "@/lib/pmf/pmfJourney";
import type {
  PlannerAgentRun,
  PlannerGenerationResult,
  PlannerRunMeta,
  PlannerRunStatus,
  PlannerStoredRun,
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

type AgentRunsGet = () => AgentRunsState;
type AgentRunsSet = (
  partial:
    | Partial<AgentRunsState>
    | ((state: AgentRunsState) => Partial<AgentRunsState> | AgentRunsState)
) => void;

async function ensureOpportunityDiscovery(
  get: AgentRunsGet,
  ctx: {
    missionId: string;
    providerInput: ProjectCreationInput & {
      projectName: string;
      missionId: string;
      clarificationRound?: number;
    };
    run: PlannerStoredRun;
  }
): Promise<{
  opportunityBrief: OpportunityBrief;
  pmfReadiness: PmfReadiness;
  currentPmfStage: PmfStage;
  opportunityAudit: AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult>;
}> {
  const existing = ctx.run.plannerMeta?.opportunityBrief;
  if (existing) {
    const pmfReadiness =
      ctx.run.plannerMeta?.pmfReadiness ??
      computePmfReadinessFromSignals({
        completenessScore: ctx.run.plannerMeta?.lastAssessment?.completenessScore ?? 60,
        missingAreas: [],
        strengths: [],
        gaps: [],
        hasBrief: false,
        hasOpportunityBrief: true,
        discoveryMode: ctx.providerInput.discoveryMode ?? "quick",
      });
    return {
      opportunityBrief: existing,
      pmfReadiness,
      currentPmfStage: ctx.run.plannerMeta?.currentPmfStage ?? inferCurrentPmfStage(pmfReadiness),
      opportunityAudit: {
        id: createAuditId(),
        missionId: ctx.missionId,
        agentId: "product_planner",
        timestamp: new Date().toISOString(),
        providerId: "cached",
        model: "cached",
        promptVersion: `${PLANNER_PROMPT_VERSION}-opportunity`,
        input: ctx.providerInput,
        reasoning: [],
        status: "success",
      },
    };
  }

  get().appendPlannerActivity(ctx.missionId, "Planner started opportunity discovery");

  const response = await fetch("/api/agents/planner/opportunity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...ctx.providerInput,
      assessment: ctx.run.plannerMeta?.lastAssessment,
    }),
  });

  const data = (await response.json()) as {
    opportunityBrief?: OpportunityBrief;
    pmfReadiness?: PmfReadiness;
    currentPmfStage?: PmfStage;
    audit?: AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult>;
    error?: string;
  };

  if (!response.ok || !data.opportunityBrief) {
    throw new Error(data.error ?? "Opportunity discovery failed");
  }

  if (data.audit) get().appendAudit(data.audit);
  get().appendPlannerActivity(ctx.missionId, "Opportunity discovery completed");

  return {
    opportunityBrief: data.opportunityBrief,
    pmfReadiness: data.pmfReadiness!,
    currentPmfStage: data.currentPmfStage ?? inferCurrentPmfStage(data.pmfReadiness!),
    opportunityAudit: data.audit!,
  };
}

async function ensureCustomerProblemFit(
  get: AgentRunsGet,
  ctx: {
    missionId: string;
    providerInput: ProjectCreationInput & {
      projectName: string;
      missionId: string;
      clarificationRound?: number;
    };
    run: PlannerStoredRun;
  }
): Promise<{
  cpfReport: CustomerProblemFitReport;
  pmfReadiness: PmfReadiness;
  currentPmfStage: PmfStage;
  painPoints: string[];
  burningNeeds: string[];
}> {
  const existing = ctx.run.plannerMeta?.cpfReport;
  if (existing) {
    return {
      cpfReport: existing,
      pmfReadiness:
        ctx.run.plannerMeta?.pmfReadiness ??
        computePmfReadinessFromSignals({
          completenessScore: 60,
          missingAreas: [],
          strengths: [],
          gaps: [],
          hasBrief: false,
          hasOpportunityBrief: !!ctx.run.plannerMeta?.opportunityBrief,
          hasCpfReport: true,
          discoveryMode: ctx.providerInput.discoveryMode ?? "quick",
        }),
      currentPmfStage: ctx.run.plannerMeta?.currentPmfStage ?? "cpf",
      painPoints: ctx.run.plannerMeta?.cpfPainPoints ?? [],
      burningNeeds: ctx.run.plannerMeta?.cpfBurningNeeds ?? [],
    };
  }

  get().appendPlannerActivities(ctx.missionId, [
    "Planner identified customer persona",
    "Planner identified customer pain points",
  ]);

  const response = await fetch("/api/agents/planner/cpf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...ctx.providerInput,
      assessment: ctx.run.plannerMeta?.lastAssessment,
      opportunityBrief: ctx.run.plannerMeta?.opportunityBrief,
    }),
  });

  const data = (await response.json()) as {
    cpfReport?: CustomerProblemFitReport;
    pmfReadiness?: PmfReadiness;
    currentPmfStage?: PmfStage;
    painPoints?: string[];
    burningNeeds?: string[];
    audit?: AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult>;
    error?: string;
  };

  if (!response.ok || !data.cpfReport) {
    throw new Error(data.error ?? "CPF analysis failed");
  }

  if (data.audit) get().appendAudit(data.audit);
  get().appendPlannerActivities(ctx.missionId, [
    "Planner evaluated burning need",
    "Planner completed CPF analysis",
  ]);

  return {
    cpfReport: data.cpfReport,
    pmfReadiness: data.pmfReadiness!,
    currentPmfStage: data.currentPmfStage ?? "cpf",
    painPoints: data.painPoints ?? [],
    burningNeeds: data.burningNeeds ?? [],
  };
}

async function ensureProblemSolutionFit(
  get: AgentRunsGet,
  ctx: {
    missionId: string;
    providerInput: ProjectCreationInput & {
      projectName: string;
      missionId: string;
      clarificationRound?: number;
    };
    run: PlannerStoredRun;
  }
): Promise<{
  psfReport: ProblemSolutionFitReport;
  pmfReadiness: PmfReadiness;
  currentPmfStage: PmfStage;
  validationAssumptions: string[];
  validationRisks: string[];
  mvpScope: string[];
}> {
  const existing = ctx.run.plannerMeta?.psfReport;
  if (existing) {
    return {
      psfReport: existing,
      pmfReadiness:
        ctx.run.plannerMeta?.pmfReadiness ??
        computePmfReadinessFromSignals({
          completenessScore: 60,
          missingAreas: [],
          strengths: [],
          gaps: [],
          hasBrief: false,
          hasOpportunityBrief: !!ctx.run.plannerMeta?.opportunityBrief,
          hasCpfReport: !!ctx.run.plannerMeta?.cpfReport,
          hasPsfReport: true,
          discoveryMode: ctx.providerInput.discoveryMode ?? "quick",
        }),
      currentPmfStage: ctx.run.plannerMeta?.currentPmfStage ?? "psf",
      validationAssumptions: ctx.run.plannerMeta?.psfValidationAssumptions ?? [],
      validationRisks: ctx.run.plannerMeta?.psfValidationRisks ?? [],
      mvpScope: ctx.run.plannerMeta?.psfMvpScope ?? [],
    };
  }

  get().appendPlannerActivity(ctx.missionId, "Planner generated solution hypothesis");

  const response = await fetch("/api/agents/planner/psf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...ctx.providerInput,
      assessment: ctx.run.plannerMeta?.lastAssessment,
      opportunityBrief: ctx.run.plannerMeta?.opportunityBrief,
      cpfReport: ctx.run.plannerMeta?.cpfReport,
    }),
  });

  const data = (await response.json()) as {
    psfReport?: ProblemSolutionFitReport;
    pmfReadiness?: PmfReadiness;
    currentPmfStage?: PmfStage;
    validationAssumptions?: string[];
    validationRisks?: string[];
    mvpScope?: string[];
    audit?: AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult>;
    error?: string;
  };

  if (!response.ok || !data.psfReport) {
    throw new Error(data.error ?? "PSF analysis failed");
  }

  if (data.audit) get().appendAudit(data.audit);
  get().appendPlannerActivities(ctx.missionId, [
    "Planner identified validation risks",
    "Planner proposed MVP scope",
    "Planner completed PSF analysis",
  ]);

  return {
    psfReport: data.psfReport,
    pmfReadiness: data.pmfReadiness!,
    currentPmfStage: data.currentPmfStage ?? "psf",
    validationAssumptions: data.validationAssumptions ?? [],
    validationRisks: data.validationRisks ?? [],
    mvpScope: data.mvpScope ?? [],
  };
}

async function completePlannerBrief(
  set: AgentRunsSet,
  get: AgentRunsGet,
  ctx: {
    missionId: string;
    key: string;
    run: PlannerStoredRun;
    providerInput: ProjectCreationInput & {
      projectName: string;
      missionId: string;
      clarificationRound?: number;
    };
    projectName: string;
    output?: PlannerGenerationResult;
    audit?: AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult>;
  }
) {
  let output = ctx.output;
  let audit = ctx.audit;
  let runWithOpportunity = ctx.run;

  if (!ctx.run.plannerMeta?.opportunityBrief) {
    get().setPlannerStatus(ctx.missionId, "working");
    const discovery = await ensureOpportunityDiscovery(get, {
      missionId: ctx.missionId,
      providerInput: ctx.providerInput,
      run: ctx.run,
    });
    applyPmfToMission(
      ctx.missionId,
      discovery.pmfReadiness,
      discovery.currentPmfStage,
      ctx.providerInput.discoveryMode ?? "quick"
    );
    runWithOpportunity = {
      ...ctx.run,
      plannerMeta: {
        ...ctx.run.plannerMeta,
        discoveryMode: ctx.run.plannerMeta?.discoveryMode ?? ctx.run.input.discoveryMode ?? "quick",
        clarificationRound: ctx.run.plannerMeta?.clarificationRound ?? 0,
        clarificationHistory: ctx.run.plannerMeta?.clarificationHistory ?? [],
        lastAssessment: ctx.run.plannerMeta?.lastAssessment,
        opportunityBrief: discovery.opportunityBrief,
        pmfReadiness: discovery.pmfReadiness,
        currentPmfStage: discovery.currentPmfStage,
      },
    };
    set((state) => ({
      runs: {
        ...state.runs,
        [ctx.key]: {
          ...runWithOpportunity,
          status: "working",
        },
      },
    }));
  }

  let runWithCpf = runWithOpportunity;
  if (!runWithOpportunity.plannerMeta?.cpfReport) {
    get().setPlannerStatus(ctx.missionId, "working");
    const cpf = await ensureCustomerProblemFit(get, {
      missionId: ctx.missionId,
      providerInput: ctx.providerInput,
      run: runWithOpportunity,
    });
    applyPmfToMission(
      ctx.missionId,
      cpf.pmfReadiness,
      cpf.currentPmfStage,
      ctx.providerInput.discoveryMode ?? "quick"
    );
    runWithCpf = {
      ...runWithOpportunity,
      plannerMeta: {
        ...runWithOpportunity.plannerMeta,
        discoveryMode:
          runWithOpportunity.plannerMeta?.discoveryMode ??
          ctx.run.input.discoveryMode ??
          "quick",
        clarificationRound: runWithOpportunity.plannerMeta?.clarificationRound ?? 0,
        clarificationHistory: runWithOpportunity.plannerMeta?.clarificationHistory ?? [],
        lastAssessment: runWithOpportunity.plannerMeta?.lastAssessment,
        opportunityBrief: runWithOpportunity.plannerMeta?.opportunityBrief,
        cpfReport: cpf.cpfReport,
        cpfPainPoints: cpf.painPoints,
        cpfBurningNeeds: cpf.burningNeeds,
        pmfReadiness: cpf.pmfReadiness,
        currentPmfStage: cpf.currentPmfStage,
      },
    };
    set((state) => ({
      runs: {
        ...state.runs,
        [ctx.key]: {
          ...runWithCpf,
          status: "working",
        },
      },
    }));
  }

  let runWithPsf = runWithCpf;
  if (!runWithCpf.plannerMeta?.psfReport) {
    get().setPlannerStatus(ctx.missionId, "working");
    const psf = await ensureProblemSolutionFit(get, {
      missionId: ctx.missionId,
      providerInput: ctx.providerInput,
      run: runWithCpf,
    });
    applyPmfToMission(
      ctx.missionId,
      psf.pmfReadiness,
      psf.currentPmfStage,
      ctx.providerInput.discoveryMode ?? "quick"
    );
    runWithPsf = {
      ...runWithCpf,
      plannerMeta: {
        ...runWithCpf.plannerMeta,
        discoveryMode:
          runWithCpf.plannerMeta?.discoveryMode ?? ctx.run.input.discoveryMode ?? "quick",
        clarificationRound: runWithCpf.plannerMeta?.clarificationRound ?? 0,
        clarificationHistory: runWithCpf.plannerMeta?.clarificationHistory ?? [],
        lastAssessment: runWithCpf.plannerMeta?.lastAssessment,
        opportunityBrief: runWithCpf.plannerMeta?.opportunityBrief,
        cpfReport: runWithCpf.plannerMeta?.cpfReport,
        cpfPainPoints: runWithCpf.plannerMeta?.cpfPainPoints,
        cpfBurningNeeds: runWithCpf.plannerMeta?.cpfBurningNeeds,
        psfReport: psf.psfReport,
        psfValidationAssumptions: psf.validationAssumptions,
        psfValidationRisks: psf.validationRisks,
        psfMvpScope: psf.mvpScope,
        pmfReadiness: psf.pmfReadiness,
        currentPmfStage: psf.currentPmfStage,
      },
    };
    set((state) => ({
      runs: {
        ...state.runs,
        [ctx.key]: {
          ...runWithPsf,
          status: "working",
        },
      },
    }));
  }

  if (!output) {
    get().setPlannerStatus(ctx.missionId, "working");
    const response = await fetch("/api/agents/planner/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ctx.providerInput),
    });
    const data = (await response.json()) as {
      output?: PlannerGenerationResult;
      audit?: AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult>;
      error?: string;
    };
    if (!response.ok || !data.output) {
      throw new Error(data.error ?? "Unable to generate Product Brief");
    }
    output = data.output;
    audit = data.audit;
  }

  const successAudit: AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult> = audit
    ? { ...audit, status: "success", output }
    : {
        id: createAuditId(),
        missionId: ctx.missionId,
        agentId: "product_planner",
        timestamp: new Date().toISOString(),
        providerId: "unknown",
        model: "unknown",
        promptVersion: PLANNER_PROMPT_VERSION,
        input: ctx.run.input,
        analysis: output.analysis,
        decisions: output.decisions,
        reasoning: output.reasoning,
        output,
        status: "success",
        clarificationRound: ctx.providerInput.clarificationRound,
      };

  get().appendAudit(successAudit);

  const priorMeta = runWithPsf.plannerMeta;
  const briefPmf = computePmfReadinessFromSignals({
    completenessScore: priorMeta?.lastAssessment?.completenessScore ?? 75,
    missingAreas: priorMeta?.lastAssessment?.missingAreas ?? [],
    strengths: priorMeta?.lastAssessment?.strengths ?? [],
    gaps: priorMeta?.lastAssessment?.gaps ?? [],
    hasBrief: true,
    hasOpportunityBrief: true,
    hasCpfReport: true,
    hasPsfReport: true,
    discoveryMode: priorMeta?.discoveryMode ?? ctx.run.input.discoveryMode ?? "quick",
  });
  if (priorMeta?.cpfReport) {
    briefPmf.cpf = Math.max(briefPmf.cpf, priorMeta.cpfReport.cpfScore);
  }
  if (priorMeta?.psfReport) {
    briefPmf.psf = Math.max(briefPmf.psf, priorMeta.psfReport.psfScore);
  }

  set((state) => ({
    runs: {
      ...state.runs,
      [ctx.key]: {
        ...runWithPsf,
        status: "completed",
        input: ctx.providerInput,
        reasoning: output.reasoning,
        audit: successAudit,
        plannerMeta: {
          ...priorMeta,
          discoveryMode: priorMeta?.discoveryMode ?? ctx.run.input.discoveryMode ?? "quick",
          clarificationRound: priorMeta?.clarificationRound ?? 0,
          clarificationHistory: priorMeta?.clarificationHistory ?? [],
          pendingQuestions: undefined,
          lastAssessment: priorMeta?.lastAssessment,
          opportunityBrief: priorMeta?.opportunityBrief,
          cpfReport: priorMeta?.cpfReport,
          cpfPainPoints: priorMeta?.cpfPainPoints,
          cpfBurningNeeds: priorMeta?.cpfBurningNeeds,
          psfReport: priorMeta?.psfReport,
          psfValidationAssumptions: priorMeta?.psfValidationAssumptions,
          psfValidationRisks: priorMeta?.psfValidationRisks,
          psfMvpScope: priorMeta?.psfMvpScope,
          pmfReadiness: briefPmf,
          currentPmfStage: inferCurrentPmfStage(briefPmf),
        },
        errorMessage: undefined,
      },
    },
  }));

  queueMicrotask(() => {
    applyPmfToMission(
      ctx.missionId,
      briefPmf,
      inferCurrentPmfStage(briefPmf),
      priorMeta?.discoveryMode ?? ctx.run.input.discoveryMode ?? "quick"
    );
  });

  queueMicrotask(() => {
    applyBriefToMission(ctx.missionId, ctx.projectName, output.brief);

    useProjectCreationStore.setState((state) => ({
      projects: state.projects.map((p) =>
        p.missionId === ctx.missionId
          ? { ...p, plannerStatus: "planning_started", productBriefGenerated: true }
          : p
      ),
    }));

    const mission = useMissionStore.getState().missions.find((m) => m.id === ctx.missionId);
    if (mission) {
      useOrganizationStore.getState().addFeedItemWithSync({
        type: "coordination",
        author: "COO",
        authorName: "Nova",
        missionId: ctx.missionId,
        missionName: mission.name,
        message: `Product Planner completed the Product Brief for "${mission.name}" — review reasoning on the project page.`,
        status: "active",
        requiresCeoApproval: false,
      });
    }
  });
}

function applyPmfToMission(
  missionId: string,
  pmfReadiness: PmfReadiness,
  currentPmfStage: PmfStage,
  discoveryMode: ProjectCreationInput["discoveryMode"]
) {
  useMissionStore.setState((state) => ({
    missions: state.missions.map((m) =>
      m.id === missionId
        ? {
            ...m,
            discoveryMode,
            pmfReadiness,
            currentPmfStage,
            updatedAt: "Just now",
          }
        : m
    ),
  }));
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
  appendPlannerActivities: (missionId: string, messages: string[]) => void;
  generatePlannerForMission: (missionId: string) => Promise<void>;
  submitPlannerClarification: (
    missionId: string,
    answers: Record<string, string>
  ) => Promise<void>;
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
          | PlannerStoredRun
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
              plannerMeta: {
                discoveryMode: input.discoveryMode ?? "quick",
                clarificationRound: 0,
                clarificationHistory: [],
              },
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
        get().appendPlannerActivities(missionId, [message]);
      },

      appendPlannerActivities: (missionId, messages) => {
        if (messages.length === 0) return;
        const items: ProjectActivityItem[] = messages.map((message) => ({
          id: activityId(),
          missionId,
          workerEmoji: "🧠",
          workerName: "Product Planner",
          message,
          timestamp: nowLabel(),
        }));
        useProjectCreationStore.setState((state) => ({
          activities: [...items, ...state.activities].slice(0, 120),
        }));
      },

      generatePlannerForMission: async (missionId) => {
        const key = agentRunKey(missionId, "product_planner");
        const run = get().runs[key] as PlannerStoredRun | undefined;
        if (
          !run ||
          run.status === "assessing" ||
          run.status === "working" ||
          run.status === "completed" ||
          run.status === "awaiting_clarification"
        ) {
          return;
        }
        if (plannerGenerationInFlight.has(missionId)) return;

        plannerGenerationInFlight.add(missionId);
        const projectName = projectNameFromIdea(run.input.idea);
        const round = run.plannerMeta?.clarificationRound ?? 0;

        const providerInput = {
          ...run.input,
          projectName,
          missionId,
          clarificationRound: round,
          questionsAskedSoFar: countQuestionsAskedForRun(run),
        };

        get().setPlannerStatus(missionId, "assessing");
        get().appendPlannerActivity(missionId, "Discovery started");
        get().appendPlannerActivity(missionId, "Planner assessing requirements");

        try {
          const assessRes = await fetch("/api/agents/planner/assess", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(providerInput),
          });
          const assessData = (await assessRes.json()) as {
            assessment?: PlannerRunMeta["lastAssessment"];
            analysis?: string;
            decisions?: string[];
            reasoning?: string[];
            audit?: AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult>;
            error?: string;
          };

          if (!assessRes.ok || !assessData.assessment) {
            throw new Error(assessData.error ?? "Planner assessment failed");
          }

          const assessAudit = assessData.audit ?? {
            id: createAuditId(),
            missionId,
            agentId: "product_planner" as const,
            timestamp: new Date().toISOString(),
            providerId: "unknown",
            model: "unknown",
            promptVersion: `${PLANNER_PROMPT_VERSION}-assess`,
            input: run.input,
            reasoning: assessData.reasoning ?? [],
            status: "success" as const,
            clarificationRound: round,
          };
          get().appendAudit(assessAudit);
          get().appendPlannerActivity(missionId, "PMF assessment completed");
          if (assessData.assessment.gaps.length > 0) {
            get().appendPlannerActivity(missionId, "Planner identified gaps");
          }

          const pmfReadiness = assessData.assessment.pmfReadiness;
          const pmfStage = inferCurrentPmfStage(pmfReadiness);
          applyPmfToMission(
            missionId,
            pmfReadiness,
            pmfStage,
            run.input.discoveryMode ?? "quick"
          );
          get().appendPlannerActivity(missionId, "Planner updated PMF readiness");

          const meta: PlannerRunMeta = {
            discoveryMode: run.input.discoveryMode ?? "quick",
            clarificationRound: round,
            clarificationHistory: run.plannerMeta?.clarificationHistory ?? [],
            lastAssessment: assessData.assessment,
            pendingQuestions: assessData.assessment.needsClarification
              ? assessData.assessment.questions
              : undefined,
            pmfReadiness,
            currentPmfStage: pmfStage,
          };

          if (
            assessData.assessment.needsClarification &&
            assessData.assessment.questions.length > 0 &&
            round < MAX_CLARIFICATION_ROUNDS
          ) {
            set((state) => ({
              runs: {
                ...state.runs,
                [key]: {
                  ...run,
                  status: "awaiting_clarification",
                  reasoning: assessData.reasoning ?? run.reasoning,
                  audit: assessAudit,
                  plannerMeta: meta,
                  errorMessage: undefined,
                },
              },
            }));
            get().appendPlannerActivity(missionId, "Planner requested clarification");
            return;
          }

          get().appendPlannerActivity(missionId, "Planner resumed analysis");
          await completePlannerBrief(set, get, {
            missionId,
            key,
            run: {
              ...run,
              input: run.input,
              plannerMeta: meta,
              reasoning: assessData.reasoning ?? run.reasoning,
            },
            providerInput,
            projectName,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Planner assessment failed";
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
            clarificationRound: round,
          };
          get().appendAudit(failureAudit);
          set((state) => ({
            runs: {
              ...state.runs,
              [key]: { ...run, status: "failed", audit: failureAudit, errorMessage: message },
            },
          }));
          get().appendPlannerActivity(missionId, "Planning failed — retry available");
        } finally {
          plannerGenerationInFlight.delete(missionId);
        }
      },

      submitPlannerClarification: async (missionId, answers) => {
        const key = agentRunKey(missionId, "product_planner");
        const run = get().runs[key] as PlannerStoredRun | undefined;
        if (!run || run.status !== "awaiting_clarification") return;
        if (plannerGenerationInFlight.has(missionId)) return;

        plannerGenerationInFlight.add(missionId);
        const projectName = projectNameFromIdea(run.input.idea);
        const round = run.plannerMeta?.clarificationRound ?? 0;
        const questions = run.plannerMeta?.pendingQuestions ?? [];

        get().setPlannerStatus(missionId, "assessing");
        get().appendPlannerActivity(missionId, "User answered clarification");

        const history = [
          ...(run.plannerMeta?.clarificationHistory ?? []),
          { round: round + 1, questions, answers },
        ];

        try {
          const response = await fetch("/api/agents/planner/clarify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              missionId,
              idea: run.input.idea,
              targetUsers: run.input.targetUsers,
              successGoal: run.input.successGoal,
              projectName,
              discoveryMode: run.plannerMeta?.discoveryMode ?? "quick",
              clarificationRound: round,
              answers,
              history: run.plannerMeta?.clarificationHistory ?? [],
              questionsAskedSoFar: countQuestionsAskedForRun(run),
            }),
          });

          const data = (await response.json()) as {
            phase?: "clarification" | "brief";
            mergedInput?: ProjectCreationInput;
            assessment?: PlannerRunMeta["lastAssessment"];
            reasoning?: string[];
            output?: PlannerGenerationResult;
            audit?: AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult>;
            error?: string;
          };

          if (!response.ok || data.error) {
            throw new Error(data.error ?? "Clarification failed");
          }

          if (data.audit) get().appendAudit(data.audit);

          const mergedInput = data.mergedInput ?? run.input;
          const nextRound = round + 1;

          if (data.phase === "clarification" && data.assessment) {
            const nextAssessment = data.assessment;
            const pmfReadiness = nextAssessment.pmfReadiness;
            const pmfStage = inferCurrentPmfStage(pmfReadiness);
            set((state) => ({
              runs: {
                ...state.runs,
                [key]: {
                  ...run,
                  status: "awaiting_clarification",
                  input: mergedInput,
                  reasoning: data.reasoning ?? run.reasoning,
                  plannerMeta: {
                    discoveryMode: run.plannerMeta?.discoveryMode ?? run.input.discoveryMode ?? "quick",
                    clarificationRound: nextRound,
                    clarificationHistory: history,
                    lastAssessment: nextAssessment,
                    pendingQuestions: nextAssessment.questions,
                    pmfReadiness,
                    currentPmfStage: pmfStage,
                  },
                },
              },
            }));
            const activityMessages = ["Planner requested clarification", "Planner updated PMF readiness"];
            if (nextAssessment.gaps.length > 0) {
              activityMessages.push("Planner identified gaps");
            }
            queueMicrotask(() => {
              applyPmfToMission(
                missionId,
                pmfReadiness,
                pmfStage,
                run.plannerMeta?.discoveryMode ?? run.input.discoveryMode ?? "quick"
              );
              get().appendPlannerActivities(missionId, activityMessages);
            });
            return;
          }

          if (data.phase === "brief" && data.output) {
            const briefAssessment = data.assessment;
            const briefPmf = briefAssessment?.pmfReadiness;
            const briefStage = briefPmf ? inferCurrentPmfStage(briefPmf) : undefined;
            const discoveryMode =
              run.plannerMeta?.discoveryMode ?? run.input.discoveryMode ?? "quick";
            await completePlannerBrief(set, get, {
              missionId,
              key,
              run: {
                ...run,
                input: mergedInput,
                plannerMeta: {
                  discoveryMode: run.plannerMeta?.discoveryMode ?? run.input.discoveryMode ?? "quick",
                  clarificationRound: nextRound,
                  clarificationHistory: history,
                  lastAssessment: briefAssessment,
                  pmfReadiness: briefPmf ?? run.plannerMeta?.pmfReadiness,
                  currentPmfStage: briefStage ?? run.plannerMeta?.currentPmfStage,
                },
              },
              providerInput: {
                ...mergedInput,
                projectName,
                missionId,
                clarificationRound: nextRound,
              },
              projectName,
              output: data.output,
              audit: data.audit,
            });
            queueMicrotask(() => {
              if (briefPmf && briefStage) {
                applyPmfToMission(missionId, briefPmf, briefStage, discoveryMode);
              }
              get().appendPlannerActivities(missionId, [
                "Planner resumed analysis",
                "Planner updated PMF readiness",
                "Planner generated Product Brief",
                "Planning completed",
              ]);
            });
            return;
          }

          throw new Error("Unexpected clarification response");
        } catch (error) {
          const message = error instanceof Error ? error.message : "Clarification failed";
          get().setPlannerStatus(missionId, "failed", message);
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
