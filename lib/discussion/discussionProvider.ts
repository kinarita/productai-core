import { fetchWithRetry } from "@/lib/agents/planner/fetchWithRetry";

export interface DiscussionProvider {
  readonly id: string;
  readonly model: string;
  completeText(system: string, user: string): Promise<string>;
  completeJson(system: string, user: string): Promise<string>;
}

export type DiscussionProviderId = "openai" | "anthropic" | "mock";

export function resolveDiscussionProviderId(): DiscussionProviderId {
  const configured = process.env.DISCUSSION_PROVIDER?.toLowerCase();
  if (configured === "openai" || configured === "anthropic" || configured === "mock") {
    return configured;
  }
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return "mock";
}

class OpenAIDiscussionProvider implements DiscussionProvider {
  readonly id = "openai";
  readonly model: string;

  constructor(
    private readonly apiKey: string,
    model = process.env.OPENAI_MODEL ?? "gpt-4o"
  ) {
    this.model = model;
  }

  async completeText(system: string, user: string): Promise<string> {
    const response = await fetchWithRetry("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.55,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenAI discussion failed (${response.status}): ${text.slice(0, 200)}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("OpenAI discussion returned empty content");
    return content;
  }

  async completeJson(system: string, user: string): Promise<string> {
    const response = await fetchWithRetry("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.35,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenAI discussion JSON failed (${response.status}): ${text.slice(0, 200)}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("OpenAI discussion JSON returned empty content");
    return content;
  }
}

class AnthropicDiscussionProvider implements DiscussionProvider {
  readonly id = "anthropic";
  readonly model: string;

  constructor(
    private readonly apiKey: string,
    model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514"
  ) {
    this.model = model;
  }

  private async message(system: string, user: string, json: boolean): Promise<string> {
    const response = await fetchWithRetry("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 2048,
        temperature: json ? 0.35 : 0.55,
        system: json ? `${system}\n\nRespond with JSON only.` : system,
        messages: [{ role: "user", content: user }],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Anthropic discussion failed (${response.status}): ${text.slice(0, 200)}`);
    }

    const data = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const content = data.content?.find((c) => c.type === "text")?.text?.trim();
    if (!content) throw new Error("Anthropic discussion returned empty content");
    return content;
  }

  completeText(system: string, user: string): Promise<string> {
    return this.message(system, user, false);
  }

  completeJson(system: string, user: string): Promise<string> {
    return this.message(system, user, true);
  }
}

export class MockDiscussionProvider implements DiscussionProvider {
  readonly id = "mock";
  readonly model = "productai-discussion-heuristic-v1";

  async completeText(): Promise<string> {
    throw new Error("MockDiscussionProvider uses heuristic runner");
  }

  async completeJson(): Promise<string> {
    throw new Error("MockDiscussionProvider uses heuristic runner");
  }
}

export function getDiscussionProvider(): DiscussionProvider {
  const id = resolveDiscussionProviderId();
  if (id === "openai") {
    const key = process.env.OPENAI_API_KEY;
    if (!key) return new MockDiscussionProvider();
    return new OpenAIDiscussionProvider(key);
  }
  if (id === "anthropic") {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return new MockDiscussionProvider();
    return new AnthropicDiscussionProvider(key);
  }
  return new MockDiscussionProvider();
}
