import type { ReplayQueryState, ReplayScope, ReplayWindow } from "@/lib/replay-query/replayQueryTypes";

export type ReplayBookmarkFocusCategory =
  | "executive_overview"
  | "runtime_continuity"
  | "governance_review"
  | "attention_interpretation"
  | "custom";

export interface ReplayBookmark {
  id: string;
  title: string;
  description?: string;
  replayQuery: ReplayQueryState;
  createdAt: string;
  lastViewedAt?: string;
  focusCategory: ReplayBookmarkFocusCategory;
  scope: ReplayScope;
  window: ReplayWindow;
}

export function createReplayBookmark(input: {
  title: string;
  replayQuery: ReplayQueryState;
  description?: string;
  focusCategory?: ReplayBookmarkFocusCategory;
}): ReplayBookmark {
  const now = new Date().toISOString();
  return {
    id: `bookmark-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: input.title,
    description: input.description,
    replayQuery: input.replayQuery,
    createdAt: now,
    focusCategory: input.focusCategory ?? "custom",
    scope: input.replayQuery.scope,
    window: input.replayQuery.replayWindow,
  };
}

export function touchReplayBookmark(bookmark: ReplayBookmark): ReplayBookmark {
  return { ...bookmark, lastViewedAt: new Date().toISOString() };
}

export function bookmarkContinuityLabel(bookmark: ReplayBookmark): string {
  return `Bookmarked ${bookmark.scope.replaceAll("_", " ")} · ${bookmark.window} window`;
}
