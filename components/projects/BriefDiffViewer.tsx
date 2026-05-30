"use client";

import type { BriefChangeSummary, BriefVersionDiff } from "@/lib/brief-diff/briefDiffTypes";

function ChangeList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{title}</p>
      <ul className="mt-1 list-inside list-disc text-sm text-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function BriefChangeSummaryBlock({ summary }: { summary: BriefChangeSummary }) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-foreground">
        Change Summary · v{summary.fromVersion} → v{summary.toVersion}
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <ChangeList title="Added" items={summary.added} />
        <ChangeList title="Modified" items={summary.modified} />
        <ChangeList title="Removed" items={summary.removed} />
      </div>
      <p className="text-xs text-muted">
        <span className="font-medium text-foreground">Reason:</span> {summary.reason}
      </p>
      <p className="text-xs text-muted">
        <span className="font-medium text-foreground">Impact:</span> {summary.impact}
      </p>
      {summary.confidence != null ? (
        <p className="text-xs text-muted">Confidence: {summary.confidence}%</p>
      ) : null}
    </div>
  );
}

export function BriefDiffViewer({
  diff,
  summary,
  compact,
}: {
  diff: BriefVersionDiff;
  summary?: BriefChangeSummary;
  compact?: boolean;
}) {
  const changed = diff.sections.filter((s) => s.changeType !== "unchanged");

  if (!diff.hasChanges && !summary?.added.length) {
    return <p className="text-sm text-muted">No textual differences detected between versions.</p>;
  }

  return (
    <div className="space-y-4">
      {summary ? <BriefChangeSummaryBlock summary={summary} /> : null}

      {!compact ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted">Section-level diff</p>
          {changed.map((section) => (
            <div
              key={section.section}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-foreground">{section.label}</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${
                    section.changeType === "added"
                      ? "bg-success/15 text-success"
                      : section.changeType === "removed"
                        ? "bg-danger/15 text-danger"
                        : "bg-warning/15 text-warning"
                  }`}
                >
                  {section.changeType}
                </span>
              </div>
              {section.before ? (
                <p className="mt-1 text-xs text-muted line-through opacity-80">{section.before}</p>
              ) : null}
              {section.after ? (
                <p className="mt-1 text-xs text-foreground">{section.after}</p>
              ) : null}
              {section.addedItems?.length ? (
                <ul className="mt-1 list-inside list-disc text-xs text-success">
                  {section.addedItems.map((i) => (
                    <li key={i}>+ {i}</li>
                  ))}
                </ul>
              ) : null}
              {section.removedItems?.length ? (
                <ul className="mt-1 list-inside list-disc text-xs text-danger">
                  {section.removedItems.map((i) => (
                    <li key={i}>− {i}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
