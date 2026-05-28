import type { ExecutionStartAuditEntry } from "@/lib/orchestration/execution-start/executionStartTypes";

export function ExecutionSessionTimeline({ entries }: { entries: ExecutionStartAuditEntry[] }) {
  if (!entries.length) return null;
  return (
    <div className="space-y-2 rounded-lg border border-border bg-background p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Execution session audit</p>
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
