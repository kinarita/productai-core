import type { AIProvider, AnalyzeInput, GenerateTextInput } from "@/lib/ai/providerTypes";

function compact(input: string, max = 140): string {
  if (input.length <= max) return input;
  return `${input.slice(0, max - 1)}...`;
}

export class MockAIProvider implements AIProvider {
  name = "Mock Operational Provider";

  async generateText(input: GenerateTextInput): Promise<string> {
    return `Operational note: ${compact(input.prompt)}`;
  }

  async summarize(input: { title: string; bullets: string[] }): Promise<string> {
    const head = input.bullets.slice(0, 2).join(" ");
    return `${input.title}: ${compact(head, 160)}`;
  }

  async analyze(input: AnalyzeInput): Promise<{ summary: string; risks: string[] }> {
    return {
      summary: `Analysis on ${input.topic}: execution remains stable with focused follow-through.`,
      risks: input.context.length > 2 ? ["Dependency pressure is increasing."] : ["No material risk signals."],
    };
  }
}
