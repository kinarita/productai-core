"use client";

import type { DevelopmentWorkItem } from "@/lib/developer/workBreakdown";

export function WorkBreakdownPanel({ items }: { items: DevelopmentWorkItem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-border text-muted">
            <th className="py-2 pr-3 font-medium">Work Item</th>
            <th className="py-2 pr-3 font-medium">Area</th>
            <th className="py-2 pr-3 font-medium">Owner Role</th>
            <th className="py-2 pr-3 font-medium">Dependencies</th>
            <th className="py-2 font-medium">Review Required</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row, i) => (
            <tr key={`${row.workItem}-${i}`} className="border-b border-border/60">
              <td className="py-2 pr-3 text-foreground">{row.workItem}</td>
              <td className="py-2 pr-3">{row.area}</td>
              <td className="py-2 pr-3">{row.ownerRole}</td>
              <td className="py-2 pr-3 text-muted">{row.dependencies}</td>
              <td className="py-2">{row.reviewRequired ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[10px] text-muted">Existing tasks organized—no auto generation.</p>
    </div>
  );
}
