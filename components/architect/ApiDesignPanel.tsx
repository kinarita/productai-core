"use client";

import type { ApiDesignRow } from "@/lib/architect/apiDesign";

export function ApiDesignPanel({ rows }: { rows: ApiDesignRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-border text-muted">
            <th className="py-2 pr-3 font-medium">Endpoint</th>
            <th className="py-2 pr-3 font-medium">Purpose</th>
            <th className="py-2 pr-3 font-medium">Consumer</th>
            <th className="py-2 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.endpoint} className="border-b border-border/60">
              <td className="py-2 pr-3 font-mono text-foreground">{row.endpoint}</td>
              <td className="py-2 pr-3">{row.purpose}</td>
              <td className="py-2 pr-3 text-muted">{row.consumer}</td>
              <td className="py-2 text-muted">{row.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[10px] text-muted">API scope for design—implementation not generated.</p>
    </div>
  );
}
