import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { missionStoreInitial } from "@/lib/store/initialState";
import { mergePersistedMissions } from "@/lib/store/mergePersistedMissions";
import type { Mission, MissionHealth, MissionStatus } from "@/types/productai";

const PERSIST_VERSION = 1;

interface PersistedMissionSlice {
  missions?: Mission[];
  selectedMissionId?: string | null;
}

export type JudgmentOutcome = "approved" | "rejected" | "revision";

interface MissionState {
  missions: Mission[];
  selectedMissionId: string | null;
  mergeMissionsFromRemote: (missions: Mission[]) => void;
  setSelectedMission: (missionId: string | null) => void;
  updateMissionStatus: (missionId: string, status: MissionStatus) => void;
  updateMissionHealth: (missionId: string, health: MissionHealth) => void;
  applyJudgmentOutcome: (missionId: string, outcome: JudgmentOutcome) => void;
  resetToInitial: () => void;
}

function touchMission(mission: Mission, patch: Partial<Mission>): Mission {
  return { ...mission, ...patch, updatedAt: "Just now" };
}

function parseUpdatedAt(value?: string): number | null {
  if (!value) return null;
  const n = Date.parse(value);
  return Number.isNaN(n) ? null : n;
}

function shouldPreferRemote(localUpdatedAt?: string, remoteUpdatedAt?: string): boolean {
  if (!remoteUpdatedAt) return false;
  const localTs = parseUpdatedAt(localUpdatedAt);
  const remoteTs = parseUpdatedAt(remoteUpdatedAt);
  if (remoteTs === null) return false;
  if (localTs === null) return true;
  return remoteTs >= localTs;
}

export const useMissionStore = create<MissionState>()(
  persist(
    (set) => ({
      ...missionStoreInitial,
      mergeMissionsFromRemote: (missions) =>
        set((state) => {
          const localById = new Map(state.missions.map((m) => [m.id, m]));
          const mergedRemote = missions.map((remote) => {
            const local = localById.get(remote.id);
            if (!local) return remote;
            if (shouldPreferRemote(local.updatedAt, remote.updatedAt)) {
              return { ...local, ...remote };
            }
            return local;
          });
          const remoteIds = new Set(mergedRemote.map((m) => m.id));
          const localOnly = state.missions.filter((m) => !remoteIds.has(m.id));
          return {
            missions: [...mergedRemote, ...localOnly],
          };
        }),
      setSelectedMission: (missionId) => set({ selectedMissionId: missionId }),
      updateMissionStatus: (missionId, status) =>
        set((state) => ({
          missions: state.missions.map((m) =>
            m.id === missionId ? touchMission(m, { status }) : m
          ),
        })),
      updateMissionHealth: (missionId, health) =>
        set((state) => ({
          missions: state.missions.map((m) =>
            m.id === missionId ? touchMission(m, { health }) : m
          ),
        })),
      applyJudgmentOutcome: (missionId, outcome) =>
        set((state) => ({
          missions: state.missions.map((m) => {
            if (m.id !== missionId) return m;

            if (outcome === "approved") {
              const score = Math.min(100, m.releaseReadiness.score + 5);
              return touchMission(m, {
                health: m.health === "blocked" ? m.health : "stable",
                status: m.status === "planning" ? "active" : m.status,
                summary: "Release readiness improved after CEO approval.",
                recentActivity:
                  "CEO approval recorded — release readiness and mission health updated.",
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
              });
            }

            if (outcome === "rejected") {
              const blockers = m.blockers.includes("CEO decision rejected — revisit scope")
                ? m.blockers
                : [...m.blockers, "CEO decision rejected — revisit scope"];
              return touchMission(m, {
                health: "risky",
                summary: "Mission at risk following CEO rejection of pending decision.",
                recentActivity:
                  "CEO rejected a pending decision — escalation recommended.",
                blockers,
                releaseReadiness: {
                  ...m.releaseReadiness,
                  summary: `${m.releaseReadiness.summary} Related CEO decision rejected.`,
                  blockers: [
                    ...m.releaseReadiness.blockers,
                    "CEO judgment: rejected",
                  ],
                },
              });
            }

            return touchMission(m, {
              health: m.health === "stable" ? "delayed" : m.health,
              summary: "CEO requested revision — mission timeline under review.",
              recentActivity: "CEO requested revision on pending decision.",
              releaseReadiness: {
                ...m.releaseReadiness,
                summary: `${m.releaseReadiness.summary} CEO requested revision.`,
              },
            });
          }),
        })),
      resetToInitial: () => set({ ...missionStoreInitial }),
    }),
    {
      name: "productai-missions",
      version: PERSIST_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        missions: state.missions,
        selectedMissionId: state.selectedMissionId,
      }),
      migrate: (persisted, version) => {
        const slice = persisted as PersistedMissionSlice;
        if (version < PERSIST_VERSION) {
          return {
            ...slice,
            missions: mergePersistedMissions(slice.missions),
          };
        }
        return slice;
      },
    }
  )
);
