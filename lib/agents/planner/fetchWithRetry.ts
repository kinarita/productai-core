const DEFAULT_RETRY_STATUSES = [429, 500, 502, 503];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Retry transient LLM API failures before surfacing errors to the app. */
export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  options?: { retries?: number; retryStatuses?: number[] }
): Promise<Response> {
  const retries = options?.retries ?? 3;
  const retryStatuses = options?.retryStatuses ?? DEFAULT_RETRY_STATUSES;
  let lastResponse: Response | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    lastResponse = await fetch(url, init);
    if (lastResponse.ok || !retryStatuses.includes(lastResponse.status)) {
      return lastResponse;
    }
    if (attempt < retries) {
      await delay(400 * Math.pow(2, attempt));
    }
  }

  return lastResponse!;
}
