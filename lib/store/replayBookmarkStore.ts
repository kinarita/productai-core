"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  createReplayBookmark,
  touchReplayBookmark,
  type ReplayBookmark,
  type ReplayBookmarkFocusCategory,
} from "@/lib/replay-query/replayBookmarks";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";

interface ReplayBookmarkState {
  bookmarks: ReplayBookmark[];
  addBookmark: (input: {
    title: string;
    replayQuery: ReplayQueryState;
    description?: string;
    focusCategory?: ReplayBookmarkFocusCategory;
  }) => ReplayBookmark;
  removeBookmark: (id: string) => void;
  touchBookmark: (id: string) => void;
  clearBookmarks: () => void;
}

export const useReplayBookmarkStore = create<ReplayBookmarkState>()(
  persist(
    (set) => ({
      bookmarks: [],
      addBookmark: (input) => {
        const bookmark = createReplayBookmark(input);
        set((state) => ({ bookmarks: [bookmark, ...state.bookmarks].slice(0, 24) }));
        return bookmark;
      },
      removeBookmark: (id) =>
        set((state) => ({ bookmarks: state.bookmarks.filter((b) => b.id !== id) })),
      touchBookmark: (id) =>
        set((state) => ({
          bookmarks: state.bookmarks.map((b) => (b.id === id ? touchReplayBookmark(b) : b)),
        })),
      clearBookmarks: () => set({ bookmarks: [] }),
    }),
    {
      name: "productai-replay-bookmarks",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ bookmarks: state.bookmarks }),
    }
  )
);
