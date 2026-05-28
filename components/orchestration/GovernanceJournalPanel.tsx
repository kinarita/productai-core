"use client";

import { useState } from "react";
import { GovernanceJournalEntryCard } from "@/components/orchestration/GovernanceJournalEntry";
import { useGovernanceJournalStore } from "@/lib/store/governanceJournalStore";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";

interface GovernanceJournalPanelProps {
  replayQuery: ReplayQueryState;
  missionId?: string;
  attentionId?: string;
  compact?: boolean;
}

export function GovernanceJournalPanel({
  replayQuery,
  missionId,
  attentionId,
  compact = false,
}: GovernanceJournalPanelProps) {
  const entries = useGovernanceJournalStore((s) => s.entries);
  const addEntry = useGovernanceJournalStore((s) => s.addEntry);
  const removeEntry = useGovernanceJournalStore((s) => s.removeEntry);

  const [title, setTitle] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [followup, setFollowup] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const save = () => {
    if (!title.trim() || !interpretation.trim()) {
      setMessage("Title and human interpretation are required.");
      return;
    }
    addEntry({
      title: title.trim(),
      summary:
        "Governance interpretation recorded for executive review continuity. AI does not author this entry.",
      relatedReplayQuery: replayQuery,
      humanInterpretation: interpretation.trim(),
      relatedMissionId: missionId,
      relatedAttentionId: attentionId,
      continuityCategory: replayQuery.continuity !== "all" ? replayQuery.continuity : "continuity_review",
      reviewContext: `Governance attention: ${replayQuery.governanceAttention}`,
      recommendedFollowup: followup.trim() || undefined,
    });
    setTitle("");
    setInterpretation("");
    setFollowup("");
    setMessage("Governance journaling helps preserve interpretation continuity across executive review sessions.");
  };

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <p className="text-xs text-muted">
        Journals capture human interpretation—not AI-authored analysis or automated summaries.
      </p>
      <div className="space-y-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Journal title"
          className="w-full rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground"
        />
        <textarea
          value={interpretation}
          onChange={(e) => setInterpretation(e.target.value)}
          placeholder="Your governance interpretation (required)"
          rows={compact ? 2 : 3}
          className="w-full rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground"
        />
        <input
          type="text"
          value={followup}
          onChange={(e) => setFollowup(e.target.value)}
          placeholder="Recommended follow-up (optional, advisory)"
          className="w-full rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground"
        />
        <button
          type="button"
          onClick={save}
          className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium text-foreground hover:bg-surface"
        >
          Save governance journal
        </button>
      </div>
      {message ? <p className="text-xs text-foreground">{message}</p> : null}
      {entries.length === 0 ? (
        <p className="text-xs text-muted">No governance journal entries yet.</p>
      ) : (
        <ul className="space-y-2">
          {entries.slice(0, compact ? 4 : 8).map((entry) => (
            <GovernanceJournalEntryCard key={entry.id} entry={entry} onRemove={removeEntry} />
          ))}
        </ul>
      )}
    </div>
  );
}
