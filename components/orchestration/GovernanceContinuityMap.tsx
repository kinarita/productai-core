"use client";

import { useMemo } from "react";
import { buildGovernanceContinuityMap } from "@/lib/orchestration/governance-history/continuityMap";
import { useReplayInterpretationStore } from "@/lib/store/replayInterpretationStore";
import { useGovernanceJournalStore } from "@/lib/store/governanceJournalStore";

export function GovernanceContinuityMap({ compact = false }: { compact?: boolean }) {
  const records = useReplayInterpretationStore((s) => s.records);
  const journals = useGovernanceJournalStore((s) => s.entries);

  const map = useMemo(
    () => buildGovernanceContinuityMap({ interpretations: records, journals }),
    [journals, records]
  );

  if (map.nodes.length === 0) {
    return (
      <p className="text-xs text-muted">
        Continuity map will appear when interpretations and journals form a readable flow.
      </p>
    );
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <p className="text-xs text-muted">{map.flowSummary}</p>
      <p className="text-xs text-muted">{map.reviewConcentrationLabel}</p>
      <p className="text-xs text-muted">{map.attentionLifecycleLabel}</p>
      <ul className="space-y-2 border-l border-border pl-3">
        {map.nodes.map((node) => (
          <li key={node.id} className="relative text-xs">
            <span className="absolute -left-[7px] top-1.5 h-2 w-2 rounded-full bg-border" />
            <p className="text-[11px] text-muted">
              {node.at.slice(0, 16)} · {node.kind}
            </p>
            <p className="font-medium text-foreground">{node.label}</p>
            <p className="text-muted">{node.detail}</p>
            {node.continuityCategory ? (
              <p className="text-[11px] text-muted">{node.continuityCategory.replaceAll("_", " ")}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
