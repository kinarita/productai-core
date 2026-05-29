"use client";

import Link from "next/link";
import type { ProductBriefBoardRow } from "@/lib/brief/productBriefAnalysis";
import { useProductBriefWorkspaceStore } from "@/lib/store/productBriefWorkspaceStore";
import { cn } from "@/lib/utils";

export function ProductBriefBoard({ rows }: { rows: ProductBriefBoardRow[] }) {
  const selectedBriefId = useProductBriefWorkspaceStore((s) => s.selectedBriefId);
  const setSelectedBrief = useProductBriefWorkspaceStore((s) => s.setSelectedBrief);

  if (rows.length === 0) {
    return <p className="text-xs text-muted">No Product Briefs match the current filters.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] text-left text-xs">
        <thead>
          <tr className="border-b border-border text-[10px] uppercase text-muted">
            <th className="px-2 py-2 font-medium">Title</th>
            <th className="px-2 py-2 font-medium">Status</th>
            <th className="px-2 py-2 font-medium">Planner</th>
            <th className="px-2 py-2 font-medium">Review State</th>
            <th className="px-2 py-2 font-medium">Approval State</th>
            <th className="px-2 py-2 font-medium">Director Readiness</th>
            <th className="px-2 py-2 font-medium">Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.briefId}
              className={cn(
                "border-b border-border/60 transition hover:bg-muted/5",
                selectedBriefId === row.briefId && "bg-accent/5"
              )}
            >
              <td className="px-2 py-2">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedBrief(selectedBriefId === row.briefId ? null : row.briefId)
                  }
                  className="font-medium text-accent hover:underline"
                >
                  {row.title}
                </button>
              </td>
              <td className="px-2 py-2">
                <span className="rounded-full border border-border px-2 py-0.5 text-[10px]">
                  {row.status}
                </span>
              </td>
              <td className="px-2 py-2 text-muted">{row.planner}</td>
              <td className="px-2 py-2 text-muted">{row.reviewState}</td>
              <td className="px-2 py-2 text-muted">{row.approvalState}</td>
              <td className="px-2 py-2 text-muted">{row.directorReadiness}</td>
              <td className="px-2 py-2 text-muted">{row.lastUpdated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
