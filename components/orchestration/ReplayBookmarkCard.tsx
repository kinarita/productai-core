"use client";

import Link from "next/link";
import { bookmarkContinuityLabel, type ReplayBookmark } from "@/lib/replay-query/replayBookmarks";
import { buildReplayHref } from "@/lib/replay-query/replayQueryNavigation";

interface ReplayBookmarkCardProps {
  bookmark: ReplayBookmark;
  linkBasePath?: string;
  onRemove?: (id: string) => void;
  onOpen?: (id: string) => void;
}

export function ReplayBookmarkCard({
  bookmark,
  linkBasePath = "/runtime-cost",
  onRemove,
  onOpen,
}: ReplayBookmarkCardProps) {
  const href = buildReplayHref(linkBasePath, bookmark.replayQuery);

  return (
    <li className="rounded-lg border border-border bg-background px-3 py-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-foreground">{bookmark.title}</p>
          <p className="mt-0.5 text-[11px] text-muted">{bookmarkContinuityLabel(bookmark)}</p>
        </div>
        <Link
          href={href}
          onClick={() => onOpen?.(bookmark.id)}
          className="text-xs font-medium text-accent hover:underline"
        >
          Open bookmark →
        </Link>
      </div>
      {bookmark.description ? (
        <p className="mt-1 text-xs text-muted">{bookmark.description}</p>
      ) : null}
      <p className="mt-1 text-[11px] text-muted">
        Replay bookmarks help maintain continuity across governance interpretation sessions.
      </p>
      {onRemove ? (
        <button
          type="button"
          onClick={() => onRemove(bookmark.id)}
          className="mt-2 text-[11px] font-medium text-muted hover:text-foreground"
        >
          Remove bookmark
        </button>
      ) : null}
    </li>
  );
}
