import { createHash } from "crypto";

/** SHA-256 hex digest (Node / server). */
export function sha256TextSync(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

export function hashPromptPair(systemPrompt: string, userPrompt: string): string {
  return sha256TextSync(`${systemPrompt}\n---\n${userPrompt}`);
}

/** SHA-256 hex digest (browser or Node). */
export async function hashPromptPairAsync(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const payload = `${systemPrompt}\n---\n${userPrompt}`;
  if (typeof window !== "undefined" && globalThis.crypto?.subtle) {
    const data = new TextEncoder().encode(payload);
    const buf = await globalThis.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  return sha256TextSync(payload);
}
