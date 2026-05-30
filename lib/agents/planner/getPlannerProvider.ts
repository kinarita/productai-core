import type { PlannerProvider } from "@/lib/agents/planner/plannerProvider";
import { AnthropicPlannerProvider } from "@/lib/agents/providers/anthropicPlannerProvider";
import { MockPlannerProvider } from "@/lib/agents/providers/mockPlannerProvider";
import { OpenAIPlannerProvider } from "@/lib/agents/providers/openaiPlannerProvider";

export type PlannerProviderId = "openai" | "anthropic" | "mock";

export function resolvePlannerProviderId(): PlannerProviderId {
  const configured = process.env.PLANNER_PROVIDER?.toLowerCase();
  if (configured === "openai" || configured === "anthropic" || configured === "mock") {
    return configured;
  }
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return "mock";
}

export function getPlannerProvider(): PlannerProvider {
  const id = resolvePlannerProviderId();
  if (id === "openai") {
    const key = process.env.OPENAI_API_KEY;
    if (!key) return new MockPlannerProvider();
    return new OpenAIPlannerProvider(key);
  }
  if (id === "anthropic") {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return new MockPlannerProvider();
    return new AnthropicPlannerProvider(key);
  }
  return new MockPlannerProvider();
}
