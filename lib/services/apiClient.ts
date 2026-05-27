export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiFailure {
  ok: false;
  error: string;
}

type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export async function apiClient<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  let payload: ApiEnvelope<T>;
  try {
    payload = (await res.json()) as ApiEnvelope<T>;
  } catch {
    throw new Error(`Invalid JSON response (${res.status})`);
  }

  if (!res.ok || !payload.ok) {
    const error = !payload.ok ? payload.error : `Request failed (${res.status})`;
    throw new Error(error);
  }
  return payload.data;
}
