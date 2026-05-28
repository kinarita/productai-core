"use client";

import { useState } from "react";
import { ReplayBookmarkCard } from "@/components/orchestration/ReplayBookmarkCard";
import { useReplayBookmarkStore } from "@/lib/store/replayBookmarkStore";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";
import type { ReplayBookmarkFocusCategory } from "@/lib/replay-query/replayBookmarks";

interface ReplayBookmarkPanelProps {
  currentReplayQuery: ReplayQueryState;
  linkBasePath?: string;
  focusCategory?: ReplayBookmarkFocusCategory;
  compact?: boolean;
}

export function ReplayBookmarkPanel({
  currentReplayQuery,
  linkBasePath = "/runtime-cost",
  focusCategory = "custom",
  compact = false,
}: ReplayBookmarkPanelProps) {
  const bookmarks = useReplayBookmarkStore((s) => s.bookmarks);
  const addBookmark = useReplayBookmarkStore((s) => s.addBookmark);
  const removeBookmark = useReplayBookmarkStore((s) => s.removeBookmark);
  const touchBookmark = useReplayBookmarkStore((s) => s.touchBookmark);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const saveCurrent = () => {
    const label =
      title.trim() ||
      `Replay · ${currentReplayQuery.scope.replaceAll("_", " ")} · ${currentReplayQuery.replayWindow}`;
    addBookmark({
      title: label,
      replayQuery: currentReplayQuery,
      description: "Saved for governance interpretation continuity.",
      focusCategory,
    });
    setTitle("");
    setMessage("Replay bookmark saved for view continuity.");
  };

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <p className="text-xs text-muted">
        Bookmarks preserve replay view continuity for recurring governance reading—not task automation.
      </p>
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Bookmark title (optional)"
          className="min-w-[12rem] flex-1 rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground"
        />
        <button
          type="button"
          onClick={saveCurrent}
          className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium text-foreground hover:bg-surface"
        >
          Save current replay view
        </button>
      </div>
      {message ? <p className="text-xs text-foreground">{message}</p> : null}
      {bookmarks.length === 0 ? (
        <p className="text-xs text-muted">No replay bookmarks yet.</p>
      ) : (
        <ul className="space-y-2">
          {bookmarks.slice(0, compact ? 4 : 8).map((bookmark) => (
            <ReplayBookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              linkBasePath={linkBasePath}
              onRemove={removeBookmark}
              onOpen={touchBookmark}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
