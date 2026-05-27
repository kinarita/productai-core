import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { missionStoreInitial } from "@/lib/store/initialState";
import type { Mission, MissionHealth, MissionStatus } from "@/types/productai";

export type JudgmentOutcome = "approved" | "rejected" | "revision";

interface MissionState {
  missions: Mission[];
  selectedMissionId: string | null;
  setSelectedMission: (missionId: string | null) => void;
  updateMissionStatus: (missionId: string, status: MissionStatus) => void;
  updateMissionHealth: (missionId: string, health: MissionHealth) => void;
  applyJudgmentOutcome: (missionId: string, outcome: JudgmentOutcome) => void;
  resetToInitial: () => void;
}

export const useMissionStore = create<MissionState>()(
  persist(
    (set) => ({
      ...missionStoreInitial,
      setSelectedMission: (missionId) => set({ selectedMissionId: missionId }),
      updateMissionStatus: (missionId, status) =>
        set((state) => ({
          missions: state.missions.map((m) =>
            m.id === missionId ? { ...m, status } : m
          ),
        })),
      updateMissionHealth: (missionId, health) =>
        set((state) => ({
          missions: state.missions.map((m) =>
            m.id === missionId ? { ...m, health } : m
          ),
        })),
      applyJudgmentOutcome: (missionId, outcome) =>
        set((state) => ({
          missions: state.missions.map((m) => {
            if (m.id !== missionId) return m;

            if (outcome === "approved") {
              const score = Math.min(100, m.releaseReadiness.score + 5);
              return {
                ...m,
                health: m.health === "blocked" ? m.health : "stable",
                status: m.status === "planning" ? "active" : m.status,
                releaseReadiness: {
                  ...m.releaseReadiness,
                  score,
                  label:
                    score >= 85
                      ? "Ready for approval"
                      : score >= 50
                        ? "In progress"
                        : m.releaseReadiness.label,
                  summary: `${m.releaseReadiness.summary} CEO approval recorded.`,
                  blockers: m.releaseReadiness.blockers.filter(
                    (b) => !b.toLowerCase().includes("ceo")
                  ),
                },
              };
            }

            if (outcome === "rejected") {
              return {
                ...m,
                health: "risky",
                releaseReadiness: {
                  ...m.releaseReadiness,
                  summary: `${m.releaseReadiness.summary} Related CEO decision rejected.`,
                },
              };
            }

            return {
              ...m,
              health: m.health === "stable" ? "delayed" : m.health,
              releaseReadiness: {
                ...m.releaseReadiness,
                summary: `${m.releaseReadiness.summary} CEO requested revision.`,
              },
            };
          }),
        })),
      resetToInitial: () => set({ ...missionStoreInitial }),
    }),
    {
      name: "productai-missions",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        missions: state.missions,
        selectedMissionId: state.selectedMissionId,
      }),
    }
  )
);
