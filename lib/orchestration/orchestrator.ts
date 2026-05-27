import { getAIProvider } from "@/lib/ai/aiProvider";
import { orchestrationAgents } from "@/lib/orchestration/agentRegistry";
import { buildExecutiveSyncPrompt } from "@/lib/orchestration/prompts/executiveSyncPrompt";
import { buildJudgmentReviewPrompt } from "@/lib/orchestration/prompts/judgmentReviewPrompt";
import { buildMissionRiskPrompt } from "@/lib/orchestration/prompts/missionRiskPrompt";
import type {
  ExecutiveDiscussion,
  ExecutionRiskSummary,
  JudgmentRecommendation,
  OrchestrationContext,
  ProductAIOrchestrator,
  ProposedTask,
} from "@/lib/orchestration/orchestrationTypes";

function chooseRiskLevel(context: OrchestrationContext): "low" | "medium" | "high" {
  const blocked = context.tasks.filter((t) => t.status === "blocked").length;
  if (blocked >= 2 || context.syncWarnings.length >= 3) return "high";
  if (blocked >= 1 || context.syncWarnings.length >= 1) return "medium";
  return "low";
}

function missionById(context: OrchestrationContext, missionId: string) {
  return context.missions.find((m) => m.id === missionId);
}

class MockProductAIOrchestrator implements ProductAIOrchestrator {
  async analyzeMission(missionId: string, context: OrchestrationContext): Promise<ExecutionRiskSummary> {
    return this.summarizeExecutionRisk(missionId, context);
  }

  async proposeTask(missionId: string, context: OrchestrationContext): Promise<ProposedTask> {
    const mission = missionById(context, missionId);
    const blocked = context.tasks.filter((t) => t.missionId === missionId && t.status === "blocked").length;
    if (blocked > 0) {
      return {
        title: `Resolve dependency blockers for ${mission?.name ?? missionId}`,
        assignedRole: "COO",
        reason: "Blocked chain should be stabilized before throughput optimization.",
      };
    }
    return {
      title: `Stabilize release checklist for ${mission?.name ?? missionId}`,
      assignedRole: "QA",
      reason: "Execution is stable; quality gate discipline is the next leverage point.",
    };
  }

  async reviewDecision(decisionId: string, context: OrchestrationContext): Promise<JudgmentRecommendation> {
    const decision = context.decisions.find((d) => d.id === decisionId);
    if (!decision) {
      return {
        decisionId,
        recommendedOption: "optionA",
        rationale: "Insufficient context; maintain conservative path.",
        executionRisk: "medium",
        dependencyConcerns: ["Decision context is missing in current state."],
      };
    }
    const prompt = buildJudgmentReviewPrompt(decision);
    const provider = getAIProvider();
    const rationale = await provider.generateText({ prompt });
    const recommendB = /scale|partition|stability|headroom/i.test(
      `${decision.title} ${decision.optionB.label} ${decision.summary}`
    );
    return {
      decisionId,
      recommendedOption: recommendB ? "optionB" : "optionA",
      rationale,
      executionRisk: recommendB ? "medium" : "low",
      dependencyConcerns:
        decision.relatedTaskIds?.length
          ? [`${decision.relatedTaskIds.length} linked execution tasks require synchronized rollout.`]
          : ["No explicit task link yet; ensure execution owner is assigned."],
    };
  }

  async summarizeExecutionRisk(
    missionId: string,
    context: OrchestrationContext
  ): Promise<ExecutionRiskSummary> {
    const mission = missionById(context, missionId);
    const provider = getAIProvider();
    const summary = mission
      ? await provider.generateText({ prompt: buildMissionRiskPrompt(mission) })
      : "Mission risk summary unavailable.";
    return {
      missionId,
      riskLevel: chooseRiskLevel(context),
      summary,
    };
  }

  async generateExecutiveSync(
    missionId: string,
    context: OrchestrationContext
  ): Promise<ExecutiveDiscussion> {
    const provider = getAIProvider();
    const prompt = buildExecutiveSyncPrompt(missionId, context);
    const summary = await provider.summarize({
      title: "Executive sync summary",
      bullets: [
        await provider.generateText({ prompt }),
        "Execution velocity is stable, with dependency pressure trending upward.",
      ],
    });
    return {
      missionId,
      opinions: [
        {
          role: "COO",
          message: "Execution velocity is stable, but dependency risk is increasing.",
        },
        {
          role: "Architect",
          message: "API schema stabilization should precede rollout to avoid rework.",
        },
        {
          role: "QA",
          message: "Review load is trending upward; prioritize validation sequencing.",
        },
      ],
      operationalSummary: summary,
    };
  }

  async generateRuntimeObserverInsight(context: OrchestrationContext): Promise<string> {
    const warnings = context.syncWarnings.length;
    if (warnings === 0) {
      return "Runtime Observer: synchronization signals are stable with no active anomaly pressure.";
    }
    return "Runtime Observer: retry and hydration warnings are elevated; local execution continuity remains stable.";
  }

  async generateOperationalFeedEvent(context: OrchestrationContext): Promise<{
    author: "COO" | "Architect" | "QA" | "Runtime Observer";
    type: "coordination" | "architecture" | "qa_review" | "runtime";
    message: string;
  }> {
    const blocked = context.tasks.filter((t) => t.status === "blocked").length;
    if (context.syncWarnings.length > 0) {
      return {
        author: "Runtime Observer",
        type: "runtime",
        message: "Runtime Observer detected elevated retry activity. Local continuity remains maintained.",
      };
    }
    if (blocked > 0) {
      return {
        author: "Architect",
        type: "architecture",
        message: "Architect dependency concern raised: unblock sequence should be finalized before additional scope.",
      };
    }
    return {
      author: "COO",
      type: "coordination",
      message: "COO operational review: mission execution cadence remains stable this cycle.",
    };
  }
}

let orchestrator: ProductAIOrchestrator | null = null;

export function getProductAIOrchestrator(): ProductAIOrchestrator {
  if (!orchestrator) orchestrator = new MockProductAIOrchestrator();
  return orchestrator;
}

export function getRegisteredOrchestrationAgents() {
  return orchestrationAgents;
}
