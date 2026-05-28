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

export const useReplaySnapshotStore = create<ReplaySnapshotState>()(
  persist(
    (set) => ({
      snapshots: [],
      recordSnapshot: (snapshot) =>
        set((state) => {
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
