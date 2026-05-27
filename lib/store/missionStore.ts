import { create } from "zustand";
import { missions as initialMissions } from "@/data/mockData";
import type { Mission, MissionHealth, MissionStatus } from "@/types/productai";

interface MissionState {
  missions: Mission[];
  selectedMissionId: string | null;
  setSelectedMission: (missionId: string | null) => void;
  updateMissionStatus: (missionId: string, status: MissionStatus) => void;
  updateMissionHealth: (missionId: string, health: MissionHealth) => void;
}

export const useMissionStore = create<MissionState>((set) => ({
  missions: initialMissions,
  selectedMissionId: null,
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
}));
