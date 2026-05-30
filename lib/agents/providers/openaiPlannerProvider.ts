import type { PlannerProvider } from "@/lib/agents/planner/plannerProvider";
import type { PlannerProviderInput } from "@/lib/agents/planner/plannerTypes";
import { parsePlannerJson } from "@/lib/agents/planner/parsePlannerResponse";
import { buildPlannerSystemPrompt, buildPlannerUserPrompt } from "@/lib/agents/planner/plannerPrompt";

export class OpenAIPlannerProvider implements PlannerProvider {
  readonly id = "openai";
  readonly model: string;

  constructor(
    private readonly apiKey: string,
    model = process.env.OPENAI_MODEL ?? "gpt-4o"
  ) {
    this.model = model;
  }

  async generateProductBrief(input: PlannerProviderInput) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: buildPlannerSystemPrompt() },
          { role: "user", content: buildPlannerUserPrompt(input) },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenAI planner failed (${response.status}): ${text.slice(0, 200)}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("OpenAI planner returned empty content");

    return parsePlannerJson(content, input);
  }
}
