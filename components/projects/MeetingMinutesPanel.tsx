"use client";

import type { MeetingMinutes } from "@/lib/discussion/decisionGovernanceTypes";

export function MeetingMinutesPanel({
  minutes,
  canGenerate,
  ceoTurnCount,
  onGenerate,
  onFinalize,
  busy,
}: {
  minutes?: MeetingMinutes;
  canGenerate: boolean;
  ceoTurnCount: number;
  onGenerate: () => void;
  onFinalize: () => void;
  busy?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface/50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
        Meeting Minutes
      </p>
      {!minutes ? (
        <>
          <p className="mt-2 text-xs text-muted">
            Organizational record: topics, decisions, rejections, and architect notes.
          </p>
          <button
            type="button"
            disabled={!canGenerate || busy}
            onClick={onGenerate}
            className="mt-3 w-full rounded-lg border border-accent/40 bg-indigo-50/50 px-3 py-1.5 text-xs font-medium text-accent hover:bg-indigo-50 disabled:opacity-50"
          >
            {canGenerate
              ? "Generate Meeting Minutes"
              : `Need more discussion (${ceoTurnCount}/2 CEO turns)`}
          </button>
        </>
      ) : (
        <div className="mt-2 max-h-72 space-y-3 overflow-y-auto text-xs">
          <Section title="Discussion Topics" items={minutes.discussionTopics} />
          <div>
            <p className="font-medium text-foreground">Decisions Made</p>
            {minutes.decisionsMade.length ? (
              <ul className="mt-1 space-y-2 text-muted">
                {minutes.decisionsMade.map((d) => (
                  <li key={d.title} className="rounded border border-border/50 px-2 py-1">
                    <p className="font-medium text-success">✓ {d.title}</p>
                    <p className="mt-0.5">
                      <span className="text-foreground">Reason:</span> {d.reason}
                    </p>
                    <p>
                      <span className="text-foreground">Impact:</span> {d.impact}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-muted">None recorded yet.</p>
            )}
          </div>
          <Section title="Rejected Ideas" items={minutes.rejectedIdeas} />
          <Section title="Open Questions" items={minutes.openQuestions} />
          <Section title="Brief Changes" items={minutes.briefChanges} />
          <Section title="Architect Notes" items={minutes.architectNotes} />
          {minutes.status === "draft" ? (
            <button
              type="button"
              disabled={busy}
              onClick={onFinalize}
              className="w-full rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:bg-surface"
            >
              Finalize Minutes
            </button>
          ) : (
            <p className="text-[11px] text-muted">Finalized</p>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <p className="font-medium text-foreground">{title}</p>
      <ul className="mt-1 list-inside list-disc text-muted">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
