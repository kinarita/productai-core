"use client";

import type { ComponentInventoryRow } from "@/lib/designer/componentInventory";

export function ComponentInventoryPanel({ rows }: { rows: ComponentInventoryRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-border text-muted">
            <th className="py-2 pr-3 font-medium">Component</th>
            <th className="py-2 pr-3 font-medium">Purpose</th>
            <th className="py-2 pr-3 font-medium">Screen Usage</th>
            <th className="py-2 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.componentName} className="border-b border-border/60">
              <td className="py-2 pr-3 font-medium text-foreground">{row.componentName}</td>
              <td className="py-2 pr-3">{row.purpose}</td>
              <td className="py-2 pr-3 text-muted">{row.screenUsage}</td>
              <td className="py-2 text-muted">{row.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
