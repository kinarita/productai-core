"use client";

import { X } from "lucide-react";
import {
  architectHandoffBlockedDetail,
  architectHandoffBlockedTitle,
  pendingDecisionsBannerMessage,
} from "@/lib/discussion/executiveRoomLabels";
import type { ArchitectHandoffPreview } from "@/lib/discussion/strategyRoomTypes";

export function ArchitectHandoffModal({
  open,
  onClose,
  preview,
  pendingCount,
}: {
  open: boolean;
  onClose: () => void;
  preview?: ArchitectHandoffPreview;
  pendingCount: number;
}) {
  if (!open) return null;

  const isPreview = preview ? !preview.handoffReady : pendingCount > 0;
  const blocked = pendingCount > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="architect-handoff-title"
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
        <h2 id="architect-handoff-title" className="pr-8 text-sm font-semibold text-accent">
          Architect Handoff
          {isPreview ? (
            <span className="ml-2 text-[10px] font-normal text-muted">(Preview)</span>
          ) : (
            <span className="ml-2 text-[10px] font-normal text-success">(Ready)</span>
          )}
        </h2>

        {blocked ? (
          <div className="mt-3 space-y-2 rounded-lg border border-danger/30 bg-red-50/40 px-3 py-2.5">
            <p className="text-xs font-semibold text-danger">{architectHandoffBlockedTitle()}</p>
            <p className="text-xs text-foreground">{architectHandoffBlockedDetail(pendingCount)}</p>
            {pendingDecisionsBannerMessage(pendingCount) ? (
              <p className="text-xs text-warning">
                {pendingDecisionsBannerMessage(pendingCount)}
              </p>
            ) : null}
          </div>
        ) : null}

        {!preview ? (
          <p className="mt-4 text-xs text-muted">
            採用済み Brief・決定・却下・保留・議事録が揃うと Architect へ渡せます。
          </p>
        ) : (
          <div className="mt-4 space-y-3 text-xs">
            <p className="text-muted">
              Approved Brief v{preview.briefVersion} ·{" "}
              {new Date(preview.generatedAt).toLocaleString()}
            </p>
            {!preview.handoffReady ? (
              <p className="text-muted">
                Preview only — resolve all decision candidates before final handoff.
              </p>
            ) : (
              <p className="text-success">
                All decision candidates resolved — final architect handoff is available.
              </p>
            )}
            <pre className="max-h-32 overflow-y-auto whitespace-pre-wrap rounded border border-border bg-surface/50 p-2 text-[11px] text-muted">
              {preview.briefHeadline}
            </pre>
            {preview.approvedDecisions.length > 0 ? (
              <section>
                <p className="font-medium text-foreground">Approved Decisions</p>
                <ul className="mt-1 space-y-1 text-muted">
                  {preview.approvedDecisions.map((d) => (
                    <li key={d.id}>✓ {d.title}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            {preview.rejectedDecisions.length > 0 ? (
              <section>
                <p className="font-medium text-foreground">Rejected Decisions</p>
                <ul className="mt-1 list-inside list-disc text-muted">
                  {preview.rejectedDecisions.map((d) => (
                    <li key={d.id}>{d.title}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            {preview.openQuestions.length > 0 ? (
              <section>
                <p className="font-medium text-foreground">Open Questions</p>
                <ul className="mt-1 list-inside list-disc text-muted">
                  {preview.openQuestions.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            {preview.meetingMinutes ? (
              <section>
                <p className="font-medium text-foreground">Meeting Minutes</p>
                <p className="mt-1 text-muted">
                  {preview.meetingMinutes.decisionsMade.length} 件の決定 ·{" "}
                  {preview.meetingMinutes.pendingDecisions?.length ?? 0} 件 pending
                </p>
              </section>
            ) : null}
            {preview.appliedChanges.length > 0 ? (
              <section>
                <p className="font-medium text-foreground">Committed Brief Changes</p>
                <ul className="mt-1 list-inside list-disc text-muted">
                  {preview.appliedChanges.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
