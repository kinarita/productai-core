"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  createGovernanceWorkspace,
  touchGovernanceWorkspace,
  type GovernanceWorkspace,
} from "@/lib/orchestration/governance-history/governanceWorkspace";
import type { GovernanceReadingModeId } from "@/lib/orchestration/governance-history/readingModes";
import {
  emptyReplayReadingContinuity,
  recordReplayReadingContinuity,
  replayReadingContinuityEqual,
  type ReplayReadingContinuity,
} from "@/lib/orchestration/governance-history/replayReadingContinuity";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";

interface GovernanceWorkspaceState {
  workspaces: GovernanceWorkspace[];
  activeWorkspaceId: string | null;
  activeReadingMode: GovernanceReadingModeId;
  reviewSequenceCursor: number;
  readingContinuity: ReplayReadingContinuity;
  createWorkspace: (input: {
    title: string;
    savedReplayQuery: ReplayQueryState;
    description?: string;
    activeReadingMode?: GovernanceReadingModeId;
  }) => GovernanceWorkspace;
  setActiveWorkspace: (id: string | null) => void;
  setActiveReadingMode: (mode: GovernanceReadingModeId) => void;
  setReviewSequenceCursor: (index: number) => void;
  updateWorkspaceQuery: (id: string, query: ReplayQueryState) => void;
  pinInterpretation: (workspaceId: string, interpretationId: string) => void;
  pinJournal: (workspaceId: string, journalId: string) => void;
  pinAttention: (workspaceId: string, attentionId: string) => void;
  recordReadingSession: (input: {
    readingMode: GovernanceReadingModeId;
    replayQuery: ReplayQueryState;
    digestContext?: string;
    reviewTheme?: string;
  }) => void;
  removeWorkspace: (id: string) => void;
  clearWorkspaces: () => void;
}

const MAX_WORKSPACES = 12;

export const useGovernanceWorkspaceStore = create<GovernanceWorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      activeWorkspaceId: null,
      activeReadingMode: "executive_overview",
      reviewSequenceCursor: 0,
      readingContinuity: emptyReplayReadingContinuity,
      createWorkspace: (input) => {
        const workspace = createGovernanceWorkspace(input);
        set((state) => ({
          workspaces: [workspace, ...state.workspaces].slice(0, MAX_WORKSPACES),
          activeWorkspaceId: workspace.id,
        }));
        return workspace;
      },
      setActiveWorkspace: (id) => {
        set({ activeWorkspaceId: id });
        if (id) {
          set((state) => ({
            workspaces: state.workspaces.map((w) =>
              w.id === id ? touchGovernanceWorkspace(w) : w
            ),
          }));
        }
      },
      setActiveReadingMode: (mode) => {
        set({ activeReadingMode: mode, reviewSequenceCursor: 0 });
        const activeId = get().activeWorkspaceId;
        if (activeId) {
          set((state) => ({
            workspaces: state.workspaces.map((w) =>
              w.id === activeId ? { ...w, activeReadingMode: mode } : w
            ),
          }));
        }
      },
      setReviewSequenceCursor: (index) => set({ reviewSequenceCursor: index }),
      updateWorkspaceQuery: (id, query) =>
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === id ? { ...w, savedReplayQuery: query, lastViewedAt: new Date().toISOString() } : w
          ),
        })),
      pinInterpretation: (workspaceId, interpretationId) =>
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === workspaceId && !w.pinnedInterpretations.includes(interpretationId)
              ? { ...w, pinnedInterpretations: [...w.pinnedInterpretations, interpretationId].slice(0, 24) }
              : w
          ),
        })),
      pinJournal: (workspaceId, journalId) =>
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === workspaceId && !w.pinnedJournals.includes(journalId)
              ? { ...w, pinnedJournals: [...w.pinnedJournals, journalId].slice(0, 24) }
              : w
          ),
        })),
      pinAttention: (workspaceId, attentionId) =>
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === workspaceId && !w.pinnedAttentionItems.includes(attentionId)
              ? { ...w, pinnedAttentionItems: [...w.pinnedAttentionItems, attentionId].slice(0, 24) }
              : w
          ),
        })),
      recordReadingSession: (input) =>
        set((state) => {
          const readingContinuity = recordReplayReadingContinuity(state.readingContinuity, {
            readingMode: input.readingMode,
            replayQuery: input.replayQuery,
            digestContext: input.digestContext,
            reviewTheme: input.reviewTheme,
          });
          if (replayReadingContinuityEqual(state.readingContinuity, readingContinuity)) {
            return state;
          }
          return { readingContinuity };
        }),
      removeWorkspace: (id) =>
        set((state) => ({
          workspaces: state.workspaces.filter((w) => w.id !== id),
          activeWorkspaceId: state.activeWorkspaceId === id ? null : state.activeWorkspaceId,
        })),
      clearWorkspaces: () =>
        set({
          workspaces: [],
          activeWorkspaceId: null,
          reviewSequenceCursor: 0,
          readingContinuity: emptyReplayReadingContinuity,
        }),
    }),
    {
      name: "productai-governance-workspace",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        workspaces: state.workspaces,
        activeWorkspaceId: state.activeWorkspaceId,
        activeReadingMode: state.activeReadingMode,
        reviewSequenceCursor: state.reviewSequenceCursor,
        readingContinuity: state.readingContinuity,
      }),
    }
  )
);
