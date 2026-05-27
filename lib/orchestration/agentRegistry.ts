import type { OrchestrationAgent } from "@/lib/orchestration/orchestrationTypes";

export const orchestrationAgents: OrchestrationAgent[] = [
  {
    id: "ceo-1",
    role: "CEO",
    displayName: "Alex Chen",
    responsibility: "Final strategic judgment and mission prioritization.",
    operationalTone: "calm executive authority",
  },
  {
    id: "coo-1",
    role: "COO",
    displayName: "Nova",
    responsibility: "Operational coordination, escalation routing, and execution rhythm.",
    operationalTone: "concise operational leadership",
  },
  {
    id: "arch-1",
    role: "Architect",
    displayName: "Sage",
    responsibility: "Architecture integrity, dependency boundaries, and scale readiness.",
    operationalTone: "technical, risk-aware clarity",
  },
  {
    id: "eng-1",
    role: "Engineer",
    displayName: "Flux",
    responsibility: "Implementation throughput and integration progress.",
    operationalTone: "execution-focused pragmatism",
  },
  {
    id: "qa-1",
    role: "QA",
    displayName: "Lens",
    responsibility: "Quality validation, regression detection, and release confidence.",
    operationalTone: "quality and risk containment",
  },
  {
    id: "observer-1",
    role: "Runtime Observer",
    displayName: "Pulse",
    responsibility: "Runtime reliability, sync anomalies, and operational continuity signals.",
    operationalTone: "calm reliability intelligence",
  },
];
