"use client";

import type { ScreenInventoryRow } from "@/lib/designer/screenInventory";

export function ScreenInventoryPanel({ rows }: { rows: ScreenInventoryRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-border text-muted">
            <th className="py-2 pr-3 font-medium">Screen Name</th>
            <th className="py-2 pr-3 font-medium">Purpose</th>
            <th className="py-2 pr-3 font-medium">Related Flow</th>
            <th className="py-2 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.screenName} className="border-b border-border/60">
              <td className="py-2 pr-3 font-medium text-foreground">{row.screenName}</td>
              <td className="py-2 pr-3">{row.purpose}</td>
              <td className="py-2 pr-3 text-muted">{row.relatedFlow}</td>
              <td className="py-2 text-muted">{row.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
