import type { PlannerProvider } from "@/lib/agents/planner/plannerProvider";
import type { PlannerProviderInput } from "@/lib/agents/planner/plannerTypes";
import {
  buildPlannerAssessSystemPrompt,
  buildPlannerAssessUserPrompt,
} from "@/lib/agents/planner/plannerAssessPrompt";
import { parsePlannerAssessmentJson } from "@/lib/agents/planner/parsePlannerAssessment";
import { parsePlannerJson } from "@/lib/agents/planner/parsePlannerResponse";
import { fetchWithRetry } from "@/lib/agents/planner/fetchWithRetry";
import { buildPlannerSystemPrompt, buildPlannerUserPrompt } from "@/lib/agents/planner/plannerPrompt";

export class AnthropicPlannerProvider implements PlannerProvider {
  readonly id = "anthropic";
  readonly model: string;

  constructor(
    private readonly apiKey: string,
    model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514"
  ) {
    this.model = model;
  }

  private async messageJson(system: string, user: string): Promise<string> {
    const response = await fetchWithRetry("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 4096,
        temperature: 0.4,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Anthropic planner failed (${response.status}): ${text.slice(0, 200)}`);
    }

    const data = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const content = data.content?.find((c) => c.type === "text")?.text;
    if (!content) throw new Error("Anthropic planner returned empty content");
    return content;
  }

  async assessRequirements(input: PlannerProviderInput) {
    const content = await this.messageJson(
      buildPlannerAssessSystemPrompt(),
      buildPlannerAssessUserPrompt(input)
    );
    return parsePlannerAssessmentJson(content, {
      input: {
        idea: input.idea,
        targetUsers: input.targetUsers,
        successGoal: input.successGoal,
        discoveryMode: input.discoveryMode ?? "quick",
        clarifications: input.clarifications,
      },
      clarificationRound: input.clarificationRound ?? 0,
      clarificationNotes: input.clarifications,
    });
  }

  async generateProductBrief(input: PlannerProviderInput) {
    const content = await this.messageJson(
      buildPlannerSystemPrompt(),
      buildPlannerUserPrompt(input)
    );
    return parsePlannerJson(content, input);
  }
}
