import type { GovernanceJournalEntry as JournalEntry } from "@/lib/orchestration/governance-history/governanceJournal";

interface GovernanceJournalEntryProps {
  entry: JournalEntry;
  onRemove?: (id: string) => void;
}

export function GovernanceJournalEntryCard({ entry, onRemove }: GovernanceJournalEntryProps) {
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
      {entry.recommendedFollowup ? (
        <p className="mt-1 text-xs text-muted">
          <span className="font-medium text-foreground">Follow-up (advisory):</span>{" "}
          {entry.recommendedFollowup}
        </p>
      ) : null}
      {onRemove ? (
        <button
          type="button"
          onClick={() => onRemove(entry.id)}
          className="mt-2 text-[11px] font-medium text-muted hover:text-foreground"
        >
          Remove journal entry
        </button>
      ) : null}
    </li>
  );
}
