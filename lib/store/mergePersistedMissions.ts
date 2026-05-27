import { missions as seedMissions } from "@/data/mockData";
import type { Mission } from "@/types/productai";

/** Reconcile persisted missions with seed data (new fields, missing missions). */
export function mergePersistedMissions(stored: Mission[] | undefined): Mission[] {
  if (!stored?.length) return seedMissions;

  const byId = new Map(stored.map((m) => [m.id, m]));
  return seedMissions.map((seed) => {
    const persisted = byId.get(seed.id);
    if (!persisted) return seed;
    return {
      ...seed,
      ...persisted,
      summary: persisted.summary || seed.summary,
      releaseReadiness: {
        ...seed.releaseReadiness,
        ...persisted.releaseReadiness,
      },
    };
  });
}
