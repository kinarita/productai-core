import { MockAIProvider } from "@/lib/ai/mockProvider";
import type { AIProvider } from "@/lib/ai/providerTypes";

let provider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (!provider) {
    provider = new MockAIProvider();
  }
  return provider;
}
