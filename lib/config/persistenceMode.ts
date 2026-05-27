export type PersistenceMode = "local" | "hybrid" | "remote";

const DEFAULT_MODE: PersistenceMode = "hybrid";

function normalizeMode(value?: string): PersistenceMode {
  if (value === "local" || value === "hybrid" || value === "remote") {
    return value;
  }
  return DEFAULT_MODE;
}

export function getPersistenceMode(): PersistenceMode {
  return normalizeMode(process.env.NEXT_PUBLIC_PRODUCTAI_PERSISTENCE_MODE);
}
