"use client";

import type { ComponentDesignRow } from "@/lib/architect/componentDesign";

export function ComponentDesignPanel({ rows }: { rows: ComponentDesignRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-border text-muted">
            <th className="py-2 pr-3 font-medium">Component</th>
            <th className="py-2 pr-3 font-medium">Responsibility</th>
            <th className="py-2 pr-3 font-medium">Dependencies</th>
            <th className="py-2 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-border/60">
              <td className="py-2 pr-3 font-medium text-foreground">{row.name}</td>
              <td className="py-2 pr-3">{row.responsibility}</td>
              <td className="py-2 pr-3 text-muted">{row.dependencies}</td>
              <td className="py-2 text-muted">{row.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
