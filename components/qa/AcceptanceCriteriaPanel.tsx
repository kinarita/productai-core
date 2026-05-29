"use client";

import type { AcceptanceCriterionRow } from "@/lib/qa/acceptanceCriteria";

export function AcceptanceCriteriaPanel({ rows }: { rows: AcceptanceCriterionRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-xs">
        <thead>
          <tr className="border-b border-border text-muted">
            <th className="pb-2 pr-3 font-medium">Criterion</th>
            <th className="pb-2 pr-3 font-medium">Related Feature</th>
            <th className="pb-2 font-medium">Validation Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={`${row.criterion}-${idx}`} className="border-b border-border/60">
              <td className="py-2 pr-3 text-foreground">{row.criterion}</td>
              <td className="py-2 pr-3 text-muted">{row.relatedFeature}</td>
              <td className="py-2 text-muted">{row.validationNotes}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[10px] text-muted">
        Acceptance criteria are planning inputs for human review—not automatic pass/fail gating.
      </p>
    </div>
  );
}

