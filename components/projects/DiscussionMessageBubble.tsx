"use client";

import { useState } from "react";
import { DiscussionMarkdown } from "@/components/projects/DiscussionMarkdown";
import type { DiscussionMessage } from "@/lib/discussion/discussionTypes";
import type { DecisionItem } from "@/lib/discussion/decisionGovernanceTypes";
import {
  AGENT_VOTE_LABELS,
  voteEmoji,
} from "@/lib/discussion/decisionGovernanceTypes";
import { getDebateDisplayState } from "@/lib/discussion/resolveExecutiveDebate";
import {
  discussionTargetLabel,
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

function DebateClarityBlock({
  msg,
  decisionItems,
}: {
  msg: DiscussionMessage;
  decisionItems: DecisionItem[];
}) {
  if (!msg.executiveDebate || !msg.debateTopic) return null;

  const { isPending, resolvedLabel } = getDebateDisplayState(msg, decisionItems);

  if (!isPending && resolvedLabel) {
    return (
      <p className="mt-1 text-[10px] text-muted">{resolvedLabel}</p>
    );
  }

  if (!isPending) return null;

  const pVote = msg.participant === "coo" ? msg.debatePartnerVote : msg.agentVote;
  const cVote = msg.participant === "coo" ? msg.agentVote : msg.debatePartnerVote;
  if (!pVote || !cVote) return null;

  return (
    <div className="mt-1 space-y-1 rounded-md border border-violet-300/60 bg-violet-50/80 px-2 py-1.5 text-[11px] text-violet-900">
      <p className="font-semibold">⚔ Debate</p>
      <p>
        <span className="font-medium">Topic:</span> {msg.debateTopic}
      </p>
      <p>
        Planner: {voteEmoji(pVote)} {AGENT_VOTE_LABELS[pVote]}
        {msg.debatePlannerReason ? (
          <span className="block pl-2 text-violet-800/90">
            「{msg.debatePlannerReason}」
          </span>
        ) : null}
      </p>
      <p>
        COO: {voteEmoji(cVote)} {AGENT_VOTE_LABELS[cVote]}
        {msg.debateCooReason ? (
          <span className="block pl-2 text-violet-800/90">
            「{msg.debateCooReason}」
          </span>
        ) : null}
      </p>
      {msg.debateWhy ? (
        <p>
          <span className="font-medium">Why Debate?</span> {msg.debateWhy}
        </p>
      ) : null}
    </div>
  );
}

export function DiscussionMessageBubble({
  msg,
  decisionItems = [],
}: {
  msg: DiscussionMessage;
  decisionItems?: DecisionItem[];
}) {
  const [expanded, setExpanded] = useState(false);
  const summary = msg.summary ?? msg.message;
  const detail = msg.detail?.trim();
  const isAgent = msg.participant === "planner" || msg.participant === "coo";
  const debateState = getDebateDisplayState(msg, decisionItems);
  const detailIsDebateSummaryOnly = !!detail?.startsWith("Debate Summary");
  const showDetailExpand =
    !!detail &&
    (!msg.executiveDebate || debateState.isPending || !detailIsDebateSummaryOnly);

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
      <DebateClarityBlock msg={msg} decisionItems={decisionItems} />
      {msg.discussionDecisionSignal && !msg.suggestsDecisionCandidate && !debateState.isPending ? (
        <p className="mt-1 rounded-md border border-sky-300/60 bg-sky-50/80 px-2 py-1 text-[11px] font-medium text-sky-900">
          ⚠ Discussion may lead to a product decision
        </p>
      ) : null}
      {msg.suggestsDecisionCandidate ? (
        <p className="mt-1 rounded-md border border-amber-300/60 bg-amber-50/80 px-2 py-1 text-[11px] font-medium text-amber-900">
          ⚠ Decision Candidate Suggested
        </p>
      ) : null}
      {isAgent ? (
        <div className="mt-1">
          <DiscussionMarkdown content={summary} />
          {detail && showDetailExpand ? (
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
        <>
          {msg.targetAudience ? (
            <p className="mt-0.5 text-[10px] text-muted">
              To: {discussionTargetLabel(msg.targetAudience)}
            </p>
          ) : null}
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{summary}</p>
        </>
      )}
      <p className="mt-1 text-[10px] text-muted">
        {new Date(msg.createdAt).toLocaleString()}
      </p>
    </li>
  );
}
