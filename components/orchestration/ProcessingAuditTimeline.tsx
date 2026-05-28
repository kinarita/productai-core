import type { ProcessingAuditEntry } from "@/lib/orchestration/processing/processingTypes";

export function ProcessingAuditTimeline({ entries }: { entries: ProcessingAuditEntry[] }) {
  if (!entries.length) return null;
  return (
    <div className="space-y-2 rounded-lg border border-border bg-background p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Processing audit continuity</p>
      <ul className="space-y-1 text-xs text-muted">
        {entries.slice(0, 6).map((entry) => (
          <li key={entry.id}>
            <span className="text-foreground">{entry.actor}</span> — {entry.message} · {entry.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
}
