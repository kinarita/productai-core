"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ExecutiveGovernanceSnapshot } from "@/lib/orchestration/governance-history/governanceHistoryTypes";

interface ReplaySnapshotState {
  snapshots: ExecutiveGovernanceSnapshot[];
  recordSnapshot: (snapshot: ExecutiveGovernanceSnapshot) => void;
  clearSnapshots: () => void;
}

const MAX_SNAPSHOTS = 10;

function snapshotsMatch(
  a: ExecutiveGovernanceSnapshot,
  b: ExecutiveGovernanceSnapshot
): boolean {
  return (
    a.id === b.id &&
    a.governanceHealthScore === b.governanceHealthScore &&
    a.reviewRequiredCount === b.reviewRequiredCount &&
    a.elevatedRiskCount === b.elevatedRiskCount &&
    a.activeProcessingCount === b.activeProcessingCount &&
    a.runtimeInstabilityCount === b.runtimeInstabilityCount
  );
}

export const useReplaySnapshotStore = create<ReplaySnapshotState>()(
  persist(
    (set) => ({
      snapshots: [],
      recordSnapshot: (snapshot) =>
        set((state) => {
          if (state.snapshots[0] && snapshotsMatch(state.snapshots[0], snapshot)) {
            return state;
          }
          const deduped = state.snapshots.filter((item) => item.id !== snapshot.id);
          return { snapshots: [snapshot, ...deduped].slice(0, MAX_SNAPSHOTS) };
        }),
      clearSnapshots: () => set({ snapshots: [] }),
    }),
    {
      name: "productai-replay-snapshots",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ snapshots: state.snapshots }),
    }
  )
);
