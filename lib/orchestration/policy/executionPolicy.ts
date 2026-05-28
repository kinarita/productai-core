export type ExecutionCapability =
  | "summarize"
  | "propose"
  | "analyze"
  | "recommend"
  | "generate_execution_plan"
  | "prepare_execution_handoff";

export type ForbiddenExecutionAction =
  | "deploy"
  | "modify_repository"
  | "merge_pull_request"
  | "delete_data"
  | "execute_code_automatically"
  | "auto_recovery"
  | "background_worker";

export interface ExecutionPolicyResult {
  allowed: ExecutionCapability[];
  forbidden: ForbiddenExecutionAction[];
  boundaryMessage: string;
}

const ALLOWED: ExecutionCapability[] = [
  "summarize",
  "propose",
  "analyze",
  "recommend",
  "generate_execution_plan",
  "prepare_execution_handoff",
];

const FORBIDDEN: ForbiddenExecutionAction[] = [
  "deploy",
  "modify_repository",
  "merge_pull_request",
  "delete_data",
  "execute_code_automatically",
  "auto_recovery",
  "background_worker",
];

export function getExecutionPolicy(): ExecutionPolicyResult {
  return {
    allowed: ALLOWED,
    forbidden: FORBIDDEN,
    boundaryMessage:
      "AI agents may analyze, propose, and prepare execution handoffs within policy boundaries. Only human approval may authorize handoff; autonomous execution remains disabled.",
  };
}

export function canPerform(capability: ExecutionCapability): boolean {
  return getExecutionPolicy().allowed.includes(capability);
}

export function isForbidden(action: ForbiddenExecutionAction): boolean {
  return getExecutionPolicy().forbidden.includes(action);
}