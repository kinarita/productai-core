"use client";

import type { FeaturePriorityRow } from "@/lib/idea/featurePrioritization";

export function FeaturePrioritizationPanel({ rows }: { rows: FeaturePriorityRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-xs">
        <thead>
          <tr className="border-b border-border text-[10px] uppercase text-muted">
            <th className="px-2 py-2 font-medium">Priority</th>
            <th className="px-2 py-2 font-medium">Feature</th>
            <th className="px-2 py-2 font-medium">Reason</th>
            <th className="px-2 py-2 font-medium">User Impact</th>
            <th className="px-2 py-2 font-medium">Complexity Note</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.priority}-${row.feature}`} className="border-b border-border/60">
              <td className="px-2 py-2 font-medium">{row.priority}</td>
              <td className="px-2 py-2">{row.feature}</td>
              <td className="px-2 py-2 text-muted">{row.reason}</td>
              <td className="px-2 py-2 text-muted">{row.userImpact}</td>
              <td className="px-2 py-2 text-muted">{row.complexityNote}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[10px] text-muted">Visualization only—not automatic prioritization.</p>
    </div>
  );
}
