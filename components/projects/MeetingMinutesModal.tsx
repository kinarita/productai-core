"use client";

import { X } from "lucide-react";
import { PRODUCT_PLANNER_DISPLAY_NAME } from "@/lib/discussion/executiveRoomLabels";
import {
  AGENT_VOTE_LABELS,
  DECISION_STATUS_LABELS,
  voteEmoji,
  type MeetingMinutes,
  type MeetingMinutesDecisionJourneyEntry,
} from "@/lib/discussion/decisionGovernanceTypes";

export function MeetingMinutesModal({
  open,
  onClose,
  minutes,
  onRefresh,
  busy,
}: {
  open: boolean;
  onClose: () => void;
  minutes?: MeetingMinutes;
  onRefresh: () => void;
  busy?: boolean;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="meeting-minutes-title"
    >
      <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-background p-5 shadow-lg">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-md p-1 text-muted hover:bg-surface"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center justify-between gap-2 pr-8">
          <h2 id="meeting-minutes-title" className="text-sm font-semibold text-foreground">
            Meeting Minutes
          </h2>
          <button
            type="button"
            disabled={busy}
            onClick={onRefresh}
            className="text-[10px] font-medium text-accent hover:underline disabled:opacity-50"
          >
            Refresh Minutes
          </button>
        </div>
        <p className="mt-1 text-[10px] text-muted">
          閲覧専用 — 会話・判断・Brief 変更から自動生成されます。
        </p>

        {!minutes ? (
          <p className="mt-4 text-xs text-muted">議事録を読み込み中…</p>
        ) : (
          <div className="mt-4 space-y-4 text-xs">
            <Section title="Discussion Topics" items={minutes.discussionTopics} />
            <DecisionJourneySection entries={minutes.decisionJourney ?? []} />
            <Section
              title="Pending Decisions"
              items={minutes.pendingDecisions ?? []}
              emptyLabel="なし"
            />
            <DecisionsSection title="Decisions Made" entries={minutes.decisionsMade} />
            <RejectedSection entries={minutes.rejectedIdeas} />
            <Section title="Open Questions" items={minutes.openQuestions} />
            <Section title="Brief Changes" items={minutes.briefChanges} />
            <Section title="Architect Notes" items={minutes.architectNotes} />
          </div>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  items,
  emptyLabel = "なし",
}: {
  title: string;
  items: string[];
  emptyLabel?: string;
}) {
  return (
    <section>
      <p className="font-medium text-foreground">{title}</p>
      {items.length ? (
        <ul className="mt-1 list-inside list-disc text-muted">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-muted">{emptyLabel}</p>
      )}
    </section>
  );
}

function DecisionJourneySection({
  entries,
}: {
  entries: MeetingMinutesDecisionJourneyEntry[];
}) {
  if (!entries.length) return null;
  return (
    <section>
      <p className="font-medium text-foreground">Decision Journey</p>
      <ul className="mt-2 space-y-3">
        {entries.map((j) => (
          <li
            key={`${j.discussion}-${j.result}`}
            className="rounded border border-border bg-surface/60 px-2 py-2 text-muted"
          >
            <p>
              <span className="text-foreground">Topic:</span> {j.topic}
            </p>
            <p>
              <span className="text-foreground">Discussion:</span> {j.discussion}
            </p>
            <p>
              {PRODUCT_PLANNER_DISPLAY_NAME}: {j.planner} · COO: {j.coo} · CEO: {j.ceo}
            </p>
            <p>
              <span className="text-foreground">Reason:</span> {j.reason}
            </p>
            <p>
              <span className="text-foreground">Result:</span> {j.result}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DecisionsSection({
  title,
  entries,
}: {
  title: string;
  entries: MeetingMinutes["decisionsMade"];
}) {
  return (
    <section>
      <p className="font-medium text-foreground">{title}</p>
      {entries.length ? (
        <ul className="mt-2 space-y-2">
          {entries.map((d) => (
            <li
              key={d.title}
              className="rounded border border-success/20 bg-emerald-50/30 px-2 py-2 text-muted"
            >
              <p className="font-medium text-success">{d.title}</p>
              <p className="mt-1">
                {PRODUCT_PLANNER_DISPLAY_NAME}: {voteEmoji(d.plannerVote)}{" "}
                {AGENT_VOTE_LABELS[d.plannerVote]}
              </p>
              <p>
                COO: {voteEmoji(d.cooVote)} {AGENT_VOTE_LABELS[d.cooVote]}
              </p>
              {d.ceoVote ? (
                <p>
                  CEO:{" "}
                  {voteEmoji(
                    d.ceoVote === "approved" || d.ceoVote === "applied_to_brief"
                      ? "approve"
                      : d.ceoVote === "rejected"
                        ? "reject"
                        : "neutral"
                  )}{" "}
                  {DECISION_STATUS_LABELS[d.ceoVote]}
                </p>
              ) : null}
              <p>Result: {DECISION_STATUS_LABELS[d.result]}</p>
              <p className="mt-1">
                <span className="text-foreground">Reason:</span> {d.reason}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-muted">なし</p>
      )}
    </section>
  );
}

function RejectedSection({ entries }: { entries: string[] }) {
  return (
    <section>
      <p className="font-medium text-foreground">Rejected</p>
      <ul className="mt-1 list-inside list-disc text-muted">
        {entries.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
