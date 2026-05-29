"use client";

import Link from "next/link";
import type { DesignHandoffContextItem } from "@/lib/designer/designerAnalysis";

export function DesignHandoffContextPanel({ items }: { items: DesignHandoffContextItem[] }) {
  if (!items.length) {
    return (
      <p className="text-xs text-muted">
        No design handoff context yet—complete architecture review in Architect Workspace first.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.missionId} className="rounded-lg border border-border px-3 py-2 text-xs">
          <p className="font-medium text-foreground">{item.missionName}</p>
          <p className="mt-1 text-muted">
            <span className="text-[10px] uppercase">Technical Specification</span>{" "}
            {item.technicalSpecificationTitle}
          </p>
          {item.openQuestions.length > 0 ? (
            <p className="mt-1 text-muted">
              <span className="text-[10px] uppercase">Open Questions</span>{" "}
              {item.openQuestions[0]}
              {item.openQuestions.length > 1 ? ` (+${item.openQuestions.length - 1} more)` : ""}
            </p>
          ) : null}
          <p className="mt-1">
            <span className="text-[10px] uppercase text-muted">Design Readiness</span>{" "}
            {item.designReadiness}
          </p>
          <Link href={item.designerHref} className="mt-2 inline-block text-accent hover:underline">
            Open Designer Workspace →
          </Link>
        </li>
      ))}
    </ul>
  );
}
