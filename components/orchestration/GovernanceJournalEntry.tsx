import type { GovernanceJournalEntry as JournalEntry } from "@/lib/orchestration/governance-history/governanceJournal";

interface GovernanceJournalEntryProps {
  entry: JournalEntry;
  onRemove?: (id: string) => void;
  onPin?: (id: string) => void;
  relatedContinuityTheme?: string;
  relatedJourneyLabel?: string;
  onOpenNarrative?: () => void;
}

export function GovernanceJournalEntryCard({
  entry,
  onRemove,
  onPin,
  relatedContinuityTheme,
  relatedJourneyLabel,
  onOpenNarrative,
}: GovernanceJournalEntryProps) {
  return (
    <li className="rounded-lg border border-border bg-background px-3 py-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{entry.title}</p>
        <span className="text-[11px] text-muted">{entry.createdAt.slice(0, 16)}</span>
      </div>
      <p className="mt-1 text-xs text-muted">{entry.summary}</p>
      <p className="mt-2 text-xs text-foreground">
        <span className="font-medium">Human interpretation:</span> {entry.humanInterpretation}
      </p>
      <p className="mt-1 text-[11px] text-muted">
        {entry.continuityCategory.replaceAll("_", " ")} · {entry.reviewContext}
      </p>
      {entry.continuityFocusTags && entry.continuityFocusTags.length > 0 ? (
        <p className="mt-1 text-[11px] text-muted">
          Focus tags: {entry.continuityFocusTags.join(", ")}
        </p>
      ) : null}
      {entry.digestContext ? (
        <p className="mt-1 text-[11px] text-muted">Digest context: {entry.digestContext}</p>
      ) : null}
      {entry.comparisonNote ? (
        <p className="mt-1 text-[11px] text-muted">Comparison: {entry.comparisonNote}</p>
      ) : null}
      {entry.recommendedFollowup ? (
        <p className="mt-1 text-xs text-muted">
          <span className="font-medium text-foreground">Follow-up (advisory):</span>{" "}
          {entry.recommendedFollowup}
        </p>
      ) : null}
      {relatedContinuityTheme ? (
        <p className="mt-1 text-[11px] text-muted">Related continuity theme: {relatedContinuityTheme}</p>
      ) : null}
      {relatedJourneyLabel ? (
        <p className="mt-1 text-[11px] text-muted">Related review journey: {relatedJourneyLabel}</p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-2">
        {onOpenNarrative ? (
          <button
            type="button"
            onClick={onOpenNarrative}
            className="text-[11px] font-medium text-accent hover:underline"
          >
            Open governance narrative
          </button>
        ) : null}
        {onPin ? (
          <button
            type="button"
            onClick={() => onPin(entry.id)}
            className="text-[11px] font-medium text-accent hover:underline"
          >
            Pin to workspace
          </button>
        ) : null}
        {onRemove ? (
          <button
            type="button"
            onClick={() => onRemove(entry.id)}
            className="text-[11px] font-medium text-muted hover:text-foreground"
          >
            Remove journal entry
          </button>
        ) : null}
      </div>
    </li>
  );
}
