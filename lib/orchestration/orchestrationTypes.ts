import type { ExecutionPlan } from "@/lib/orchestration/policy/policyTypes";
import type { AIProposal } from "@/lib/orchestration/policy/policyTypes";
import type { Decision, Mission, OrganizationFeedItem, Task } from "@/types/productai";

export type OrchestrationAgentRole =
  | "CEO"
  | "COO"
  | "Architect"
  | "Engineer"
  | "QA"
  | "Runtime Observer";

export interface OrchestrationAgent {
  id: string;
  role: OrchestrationAgentRole;
  displayName: string;
  responsibility: string;
  operationalTone: string;
}

export interface OrchestrationContext {
  missions: Mission[];
  tasks: Task[];
  decisions: Decision[];
  feedItems: OrganizationFeedItem[];
  syncWarnings: string[];
  runtimeAlerts: string[];
}

export interface JudgmentRecommendation {
  decisionId: string;
  recommendedOption: "optionA" | "optionB";
  rationale: string;
  executionRisk: string;
  dependencyConcerns: string[];
  governanceNote?: string;
  executionImpact?: string;
  approvalBoundary?: string;
}

export interface ExecutiveDiscussion {
  missionId: string;
  opinions: { role: OrchestrationAgentRole; message: string }[];
  operationalSummary: string;
}

export interface ExecutionRiskSummary {
  missionId: string;
  riskLevel: "low" | "medium" | "high";
  summary: string;
}

export interface ProposedTask {
  title: string;
  assignedRole: "COO" | "Architect" | "Engineer" | "QA";
  reason: string;
}

export interface ProductAIOrchestrator {
  analyzeMission(missionId: string, context: OrchestrationContext): Promise<ExecutionRiskSummary>;
  proposeTask(missionId: string, context: OrchestrationContext): Promise<ProposedTask>;
  reviewDecision(decisionId: string, context: OrchestrationContext): Promise<JudgmentRecommendation>;
  summarizeExecutionRisk(missionId: string, context: OrchestrationContext): Promise<ExecutionRiskSummary>;
  generateExecutiveSync(missionId: string, context: OrchestrationContext): Promise<ExecutiveDiscussion>;
  generateRuntimeObserverInsight(context: OrchestrationContext): Promise<string>;
  generateOperationalFeedEvent(context: OrchestrationContext): Promise<{
    author: "COO" | "Architect" | "QA" | "Runtime Observer";
    type: OrganizationFeedItem["type"];
    message: string;
  }>;
  generateExecutiveProposals(
    missionId: string,
    context: OrchestrationContext
  ): Promise<Omit<AIProposal, "id" | "status" | "createdAt">[]>;
  generateExecutionPlan(
    missionId: string,
    proposal: AIProposal,
    context: OrchestrationContext
  ): Promise<ExecutionPlan>;
  generateGovernanceFeedEvent(
    context: OrchestrationContext,
    kind: "approval" | "architect_review" | "runtime_recommendation"
  ): Promise<{ author: "COO" | "Architect" | "Runtime Observer"; type: OrganizationFeedItem["type"]; message: string; requiresCeoApproval: boolean }>;
}
