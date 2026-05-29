import type { ProductIdea } from "@/lib/idea/ideaWorkspace";

export interface ValueProposition {
  targetUser: string;
  expectedValue: string;
  differentiation: string;
  whyNow: string;
  successSignals: string[];
}

export function buildValueProposition(idea: ProductIdea): ValueProposition {
  return {
    targetUser:
      idea.tags.includes("enterprise")
        ? "Enterprise customers requiring SSO, billing, and support integration"
        : idea.tags.includes("analytics")
          ? "Operations leaders needing sub-5s metrics freshness"
          : "Users seeking a streamlined product experience",
    expectedValue:
      "Reduce time from CEO idea to authorized Product Brief with clear MVP boundaries and executive-readable planning context.",
    differentiation:
      "Human CEO authorization with AI Planner organization—no autonomous product strategy or automatic mission creation.",
    whyNow:
      "Organization health and active missions suggest capacity to refine new opportunities without execution automation.",
    successSignals: [
      "CEO can read Product Brief draft within one workspace",
      "Planner artifacts connect to Artifact Review and Team Handoff",
      "Clear MVP scope before Director mission planning",
    ],
  };
}
