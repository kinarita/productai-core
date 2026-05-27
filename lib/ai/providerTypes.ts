export interface GenerateTextInput {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AnalyzeInput {
  topic: string;
  context: string[];
}

export interface AIProvider {
  name: string;
  generateText(input: GenerateTextInput): Promise<string>;
  summarize(input: { title: string; bullets: string[] }): Promise<string>;
  analyze(input: AnalyzeInput): Promise<{ summary: string; risks: string[] }>;
}
