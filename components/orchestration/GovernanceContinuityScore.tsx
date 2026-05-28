export function GovernanceContinuityScore({ score }: { score: number }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <p className="text-xs font-medium uppercase text-muted">Governance continuity score</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{score}</p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-background">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted">Reference metric only. No autonomous control is applied.</p>
    </div>
  );
}
