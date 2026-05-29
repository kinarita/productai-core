"use client";

import Link from "next/link";
import type { ProductPipelineStageCount } from "@/lib/ceo-command/ceoCommandCenterAnalysis";

export function ProductPipelinePanel({ stages }: { stages: ProductPipelineStageCount[] }) {
  return (
    <div className="space-y-3">
      <ul className="space-y-0">
        {stages.map((stage, index) => (
          <li key={stage.stage} className="flex flex-col items-center">
            <div className="flex w-full max-w-md items-center justify-between rounded-lg border border-border px-4 py-2">
              <span className="text-sm font-medium">{stage.label}</span>
              <span className="text-lg font-semibold text-accent">{stage.count}</span>
            </div>
            {index < stages.length - 1 ? (
              <span className="py-1 text-lg text-muted" aria-hidden>
                ↓
              </span>
            ) : null}
          </li>
        ))}
      </ul>
      <Link href="/product-lifecycle" className="text-xs text-accent hover:underline">
        Open Lifecycle Workspace
      </Link>
    </div>
  );
}
