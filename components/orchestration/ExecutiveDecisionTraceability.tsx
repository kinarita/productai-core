"use client";

import { useDecisionTraceability } from "@/lib/hooks/useDecisionTraceability";
import { useDecisionTraceabilityStore } from "@/lib/store/decisionTraceabilityStore";
import { TraceabilitySummaryPanel } from "@/components/orchestration/TraceabilitySummary";
import { DecisionPathExplorer } from "@/components/orchestration/DecisionPathExplorer";
import {
  TraceabilityInspector,
  TraceabilityNodeList,
} from "@/components/orchestration/TraceabilityInspector";
import { DecisionPathTimeline } from "@/components/orchestration/DecisionPathTimeline";
import type { DecisionAttentionItem } from "@/lib/orchestration/decision-attention/decisionAttention";
import { cn } from "@/lib/utils";

export function ExecutiveDecisionTraceability({
  decisionAttention = [],
  compact = false,
  showSummary = true,
  showPaths = true,
  showTimeline = true,
  showInspector = true,
}: {
  decisionAttention?: DecisionAttentionItem[];
  compact?: boolean;
  showSummary?: boolean;
  showPaths?: boolean;
  showTimeline?: boolean;
  showInspector?: boolean;
}) {
  const { traceability, summary } = useDecisionTraceability(decisionAttention);
  const activeView = useDecisionTraceabilityStore((s) => s.activeTraceabilityView);
  const setActiveView = useDecisionTraceabilityStore((s) => s.setActiveTraceabilityView);

  const views = [
    { id: "summary" as const, label: "Summary" },
    { id: "paths" as const, label: "Paths" },
    { id: "timeline" as const, label: "Timeline" },
    { id: "inspector" as const, label: "Inspector" },
  ];

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <p className="text-xs text-muted">
        This traceability view supports continuity of executive understanding. It explains what connected
        over time—not what the system decided.
      </p>

      {!compact ? (
        <div className="flex flex-wrap gap-1">
          {views.map((view) => (
            <button
              key={view.id}
              type="button"
              onClick={() => setActiveView(view.id)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                activeView === view.id
                  ? "border-accent bg-indigo-50 text-accent"
                  : "border-border bg-background text-muted hover:bg-surface"
              )}
            >
              {view.label}
            </button>
          ))}
        </div>
      ) : null}

      {(activeView === "summary" || compact) && showSummary ? (
        <TraceabilitySummaryPanel summary={summary} compact={compact} />
      ) : null}

      {(activeView === "paths" || compact) && showPaths ? (
        <div>
          {!compact ? (
            <p className="mb-2 text-xs font-medium uppercase text-muted">Decision path explorer</p>
          ) : null}
          <DecisionPathExplorer traceability={traceability} compact={compact} />
        </div>
      ) : null}

      {(activeView === "timeline" || compact) && showTimeline ? (
        <div>
          {!compact ? (
            <p className="mb-2 text-xs font-medium uppercase text-muted">Decision path timeline</p>
          ) : null}
          <DecisionPathTimeline traceability={traceability} />
        </div>
      ) : null}

      {(activeView === "inspector" || compact) && showInspector ? (
        <div className={compact ? "space-y-2" : "grid gap-4 lg:grid-cols-2"}>
          <div>
            {!compact ? (
              <p className="mb-2 text-xs font-medium uppercase text-muted">Trace nodes</p>
            ) : null}
            <TraceabilityNodeList traceability={traceability} compact={compact} />
          </div>
          <div>
            {!compact ? (
              <p className="mb-2 text-xs font-medium uppercase text-muted">Traceability inspector</p>
            ) : null}
            <TraceabilityInspector traceability={traceability} />
          </div>
        </div>
      ) : null}

      <p className="text-[11px] text-muted">
        {traceability.nodes.length} trace nodes · {traceability.pathways.length} pathways · layered on
        decision memory atlas
      </p>
    </div>
  );
}
