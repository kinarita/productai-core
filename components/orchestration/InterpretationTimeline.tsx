"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useReplayInterpretationStore } from "@/lib/store/replayInterpretationStore";
import { useGovernanceJournalStore } from "@/lib/store/governanceJournalStore";
import { buildReplayHref } from "@/lib/replay-query/replayQueryNavigation";
import { formatInterpretationRecordLabel } from "@/lib/orchestration/governance-history/replayInterpretationHistory";

type TimelineItem =
  | { kind: "interpretation"; id: string; at: string; title: string; detail: string; href: string }
  | { kind: "journal"; id: string; at: string; title: string; detail: string; href: string };

interface InterpretationTimelineProps {
  linkBasePath?: string;
  maxItems?: number;
}

export function InterpretationTimeline({
  linkBasePath = "/runtime-cost",
  maxItems = 12,
}: InterpretationTimelineProps) {
  const records = useReplayInterpretationStore((s) => s.records);
  const journals = useGovernanceJournalStore((s) => s.entries);

  const items = useMemo(() => {
    const timeline: TimelineItem[] = [
      ...records.map((r) => ({
        kind: "interpretation" as const,
        id: r.id,
        at: r.createdAt,
        title: formatInterpretationRecordLabel(r),
        detail: r.summary,
        href: buildReplayHref(linkBasePath, r.replayQuery),
      })),
      ...journals.map((j) => ({
        kind: "journal" as const,
        id: j.id,
        at: j.createdAt,
        title: j.title,
        detail: j.humanInterpretation,
        href: buildReplayHref(linkBasePath, j.relatedReplayQuery),
      })),
    ];
    return timeline.sort((a, b) => b.at.localeCompare(a.at)).slice(0, maxItems);
  }, [journals, linkBasePath, records, maxItems]);

  if (items.length === 0) {
    return (
      <p className="text-xs text-muted">
        Interpretation timeline will populate as you record interpretations and governance journals.
      </p>
    );
  }

  return (
    <ul className="space-y-2 border-l border-border pl-3">
      {items.map((item) => (
        <li key={`${item.kind}-${item.id}`} className="relative">
          <span className="absolute -left-[7px] top-1.5 h-2 w-2 rounded-full bg-border" />
          <p className="text-[11px] text-muted">
            {item.at.slice(0, 16)} · {item.kind === "journal" ? "governance journal" : "replay interpretation"}
          </p>
          <p className="text-sm font-medium text-foreground">{item.title}</p>
          <p className="text-xs text-muted">{item.detail}</p>
          <Link href={item.href} className="text-xs font-medium text-accent hover:underline">
            Open context →
          </Link>
        </li>
      ))}
    </ul>
  );
}
