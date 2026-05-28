import { replayDiagnosticsDefinitions } from "@/lib/replay-query/replayDiagnosticsLabels";

export function ReplayDiagnosticsDefinition({
  compact = false,
}: {
  compact?: boolean;
}) {
  const entries = Object.entries(replayDiagnosticsDefinitions);
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        Replay diagnostics definitions
      </p>
      <ul className={`mt-2 space-y-1 text-xs text-muted ${compact ? "" : "sm:columns-2"}`}>
        {entries.map(([key, description]) => (
          <li key={key}>
            <span className="font-medium text-foreground">
              {key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (s) => s.toUpperCase())}
              :
            </span>{" "}
            {description}
          </li>
        ))}
      </ul>
    </div>
  );
}
