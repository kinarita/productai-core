"use client";

import { useState } from "react";
import type { ArchitectHandoffPreview } from "@/lib/discussion/strategyRoomTypes";
export function ArchitectHandoffPreviewPanel({
  preview,
}: {
  preview?: ArchitectHandoffPreview;
}) {
  const [open, setOpen] = useState(false);

  if (!preview) {
    return (
      <div className="rounded-lg border border-dashed border-border p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Architect Will Receive
        </p>
        <p className="mt-2 text-xs text-muted">
          Handoff package builds as decisions and meeting minutes accumulate.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-accent/25 bg-indigo-50/30 p-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          Architect Will Receive
        </p>
        <span className="text-xs text-muted">{open ? "▲" : "▼"}</span>
      </button>
      {open ? (
        <div className="mt-3 space-y-3 text-xs">
          <p className="text-muted">
            Brief v{preview.briefVersion} · {new Date(preview.generatedAt).toLocaleString()}
          </p>
          <pre className="max-h-28 overflow-y-auto whitespace-pre-wrap rounded border border-border bg-background p-2 text-[11px] text-muted">
            {preview.briefHeadline}
          </pre>
          {preview.approvedDecisions.length > 0 ? (
            <section>
              <p className="font-medium text-foreground">Approved Decisions</p>
              <ul className="mt-1 space-y-1 text-muted">
                {preview.approvedDecisions.map((d) => (
                  <li key={d.id}>
                    ✓ {d.title} — {d.rationale.slice(0, 80)}
                  </li>
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
                {preview.meetingMinutes.decisionsMade.length} decision(s) documented ·{" "}
                {preview.meetingMinutes.status}
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
      ) : (
        <p className="mt-2 text-xs text-muted">
          {preview.approvedDecisions.length} approved · {preview.rejectedDecisions.length}{" "}
          rejected · {preview.openQuestions.length} open
        </p>
      )}
    </div>
  );
}
