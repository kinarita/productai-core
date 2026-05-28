import Link from "next/link";

export function ReplayShareCard({
  shareHref,
  onShare,
  onExportInterpretation,
}: {
  shareHref: string;
  onShare: () => void;
  onExportInterpretation?: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <p className="text-xs font-medium uppercase text-muted">Replay share</p>
      <p className="mt-1 text-xs text-muted">
        Shareable replay views preserve governance continuity filters across executive drilldown.
      </p>
      <p className="mt-1 text-[11px] text-muted">
        Export includes replay query, scope, continuity explanation, interpretation preset, and diagnostics
        summary only—never execution intent or authorization state.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onShare}
          className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground hover:bg-surface"
        >
          Share Replay View
        </button>
        {onExportInterpretation ? (
          <button
            type="button"
            onClick={onExportInterpretation}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-accent hover:bg-surface"
          >
            Export replay interpretation context
          </button>
        ) : null}
        <Link
          href={shareHref}
          className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-accent hover:bg-surface"
        >
          Open shared replay →
        </Link>
      </div>
    </div>
  );
}
