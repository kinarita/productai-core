"use client";

import { useState } from "react";
import { DiscussionMarkdown } from "@/components/projects/DiscussionMarkdown";
import type { DiscussionMessage } from "@/lib/discussion/discussionTypes";
import {
  PRODUCT_PLANNER_DISPLAY_NAME,
  PRODUCT_PLANNER_EMOJI,
} from "@/lib/discussion/executiveRoomLabels";

const PARTICIPANT_LABEL: Record<DiscussionMessage["participant"], string> = {
  ceo: "CEO",
  planner: PRODUCT_PLANNER_DISPLAY_NAME,
  coo: "COO",
};

const PARTICIPANT_EMOJI: Record<DiscussionMessage["participant"], string> = {
  ceo: "👤",
  planner: PRODUCT_PLANNER_EMOJI,
  coo: "🧭",
};

export function DiscussionMessageBubble({ msg }: { msg: DiscussionMessage }) {
  const [expanded, setExpanded] = useState(false);
  const summary = msg.summary ?? msg.message;
  const detail = msg.detail?.trim();
  const isAgent = msg.participant === "planner" || msg.participant === "coo";

  return (
    <li
      className={`rounded-lg border px-3 py-2 ${
        msg.participant === "ceo"
          ? "border-accent/30 bg-indigo-50/30 ml-4"
          : "border-border bg-surface mr-4"
      }`}
    >
      <p className="text-xs font-medium text-foreground">
        {PARTICIPANT_EMOJI[msg.participant]} {PARTICIPANT_LABEL[msg.participant]}
        {msg.relatedSection ? (
          <span className="ml-2 font-normal text-muted">· {msg.relatedSection}</span>
        ) : null}
      </p>
      {isAgent ? (
        <div className="mt-1">
          <DiscussionMarkdown content={summary} />
          {detail ? (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="text-xs font-medium text-accent hover:underline"
              >
                {expanded ? "▲ 詳細を閉じる" : "▼ 詳細を見る"}
              </button>
              {expanded ? (
                <div className="mt-2 rounded-md border border-border/60 bg-background/60 px-2 py-2">
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted">
                    Detailed Analysis
                  </p>
                  <DiscussionMarkdown content={detail} />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : (
        <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{summary}</p>
      )}
      <p className="mt-1 text-[10px] text-muted">
        {new Date(msg.createdAt).toLocaleString()}
      </p>
    </li>
  );
}
