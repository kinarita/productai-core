import type { AgentId } from "@/lib/agents/audit/agentAuditTypes";

export const agentDisplayNames: Record<AgentId, string> = {
  product_planner: "Product Planner",
  coo_reviewer: "COO Reviewer",
  ceo_reviewer: "CEO Reviewer (legacy)",
  architect: "Architect",
  designer: "Designer",
  developer: "Developer",
  qa_reviewer: "QA Reviewer",
};

export function agentDisplayName(agentId: AgentId): string {
  return agentDisplayNames[agentId] ?? agentId;
}
