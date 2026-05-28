export type ProposalStatus =
  | "proposal"
  | "approval_required"
  | "approved"
  | "revision_requested"
  | "rejected"
  | "execution_planned";

export type ProposalRiskLevel = "low" | "medium" | "high";

export type ProposalType =
  | "executive_summary"
  | "architecture_change"
  | "release_decision"
  | "dependency_escalation"
  | "runtime_recovery"
  | "execution_plan"
  | "informational";

export interface ApprovalRequirement {
  requiresCEOApproval: boolean;
  reason: string;
}

export interface ProposalRisk {
  level: ProposalRiskLevel;
  factors: string[];
}

export interface AIProposal {
  id: string;
  sourceAgent: string;
  proposalType: ProposalType;
  summary: string;
  rationale: string;
  risk: ProposalRisk;
  requiresCEOApproval: boolean;
  status: ProposalStatus;
  missionId?: string;
  decisionId?: string;
  createdAt: string;
  governanceNote?: string;
}

export interface ExecutionPlanItem {
  title: string;
  assignedRole: "COO" | "Architect" | "Engineer" | "QA";
  reason: string;
}

export interface ExecutionPlan {
  id: string;
  proposalId?: string;
  missionId: string;
  summary: string;
  proposedTasks: ExecutionPlanItem[];
  dependencyNotes: string[];
  reviewRequirements: string[];
  qaCheckpoints: string[];
  runtimeConsiderations: string[];
  status: ProposalStatus;
  createdAt: string;
  governanceNote: string;
}