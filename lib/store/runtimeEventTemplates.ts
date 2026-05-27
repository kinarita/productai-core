import type { RuntimeCost } from "@/types/productai";

export interface RuntimeEventTemplate {
  provider: string;
  health: RuntimeCost["health"];
  alertSeverity: "info" | "warning" | "danger";
  alertMessage: string;
  feedMessage: string;
  tokenDelta?: number;
}

export const RUNTIME_EVENT_TEMPLATES: RuntimeEventTemplate[] = [
  {
    provider: "Anthropic Claude",
    health: "degraded",
    alertSeverity: "warning",
    alertMessage: "Claude latency increased — response times above baseline",
    feedMessage: "COO noted provider instability: Claude latency increased across mission workloads.",
    tokenDelta: 12_000,
  },
  {
    provider: "OpenAI GPT-4o",
    health: "healthy",
    alertSeverity: "info",
    alertMessage: "OpenAI recovered — latency returned to normal",
    feedMessage: "Runtime alert cleared: OpenAI GPT-4o recovered to healthy operational state.",
  },
  {
    provider: "Google Gemini",
    health: "degraded",
    alertSeverity: "warning",
    alertMessage: "Gemini timeout spike detected on embedding batch jobs",
    feedMessage: "Architect flagged Gemini timeout spike during analytics preprocessing.",
    tokenDelta: 8_000,
  },
  {
    provider: "Anthropic Claude",
    health: "healthy",
    alertSeverity: "info",
    alertMessage: "Anthropic Claude API health restored",
    feedMessage: "Provider health update: Claude API returned to healthy status.",
  },
  {
    provider: "OpenAI GPT-4o",
    health: "degraded",
    alertSeverity: "warning",
    alertMessage: "OpenAI rate limit proximity — monitor token usage",
    feedMessage: "COO escalated provider watch: OpenAI approaching rate limit threshold.",
    tokenDelta: 25_000,
  },
  {
    provider: "Embeddings API",
    health: "healthy",
    alertSeverity: "warning",
    alertMessage: "Token usage threshold warning — 82% of monthly budget projected",
    feedMessage: "Runtime alert: token usage threshold warning — review mission AI spend.",
    tokenDelta: 15_000,
  },
];

export function pickRandomRuntimeEvent(): RuntimeEventTemplate {
  return RUNTIME_EVENT_TEMPLATES[
    Math.floor(Math.random() * RUNTIME_EVENT_TEMPLATES.length)
  ];
}

export function randomRuntimeEventIntervalMs(): number {
  return 20_000 + Math.floor(Math.random() * 40_000);
}
