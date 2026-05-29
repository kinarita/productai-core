"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { RepositoryWorkspaceViewId } from "@/lib/repository/repositoryWorkspace";

interface RepositoryWorkspaceState {
  selectedRepositoryId: string | null;
  selectedBranch: string | null;
  selectedPullRequestId: string | null;
  selectedView: RepositoryWorkspaceViewId;
  setSelectedRepository: (id: string | null) => void;
  setSelectedBranch: (branch: string | null) => void;
  setSelectedPullRequest: (id: string | null) => void;
  setSelectedView: (view: RepositoryWorkspaceViewId) => void;
}

export const useRepositoryWorkspaceStore = create<RepositoryWorkspaceState>()(
  persist(
    (set) => ({
      selectedRepositoryId: null,
      selectedBranch: null,
      selectedPullRequestId: null,
      selectedView: "board",
      setSelectedRepository: (id) => set({ selectedRepositoryId: id }),
      setSelectedBranch: (branch) => set({ selectedBranch: branch }),
      setSelectedPullRequest: (id) => set({ selectedPullRequestId: id }),
      setSelectedView: (view) => set({ selectedView: view }),
    }),
    {
      name: "productai-repository-workspace",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedRepositoryId: state.selectedRepositoryId,
        selectedBranch: state.selectedBranch,
        selectedPullRequestId: state.selectedPullRequestId,
        selectedView: state.selectedView,
      }),
    }
  )
);
