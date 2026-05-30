"use client";

import type { BriefVersionDiff } from "@/lib/brief-diff/briefDiffTypes";

/** Compact before/after preview after Apply (Phase 24.5-F). */
export function InlineBriefDiffPreview({ diff }: { diff: BriefVersionDiff }) {
  const changed = diff.sections.filter((s) => s.changeType !== "unchanged");
  if (!changed.length) {
    return <p className="text-xs text-muted">差分のテキストは検出されませんでした。</p>;
  }

  return (
    <div className="mt-2 space-y-2 rounded-md border border-border bg-background/80 px-3 py-2 font-mono text-xs">
      {changed.map((section) => (
        <div key={section.section}>
          <p className="font-sans text-[11px] font-medium text-foreground">{section.label}</p>
          {section.before ? (
            <p className="text-danger/90">
              <span className="select-none text-muted">- </span>
              {section.before}
            </p>
          ) : null}
          {section.removedItems?.map((item) => (
            <p key={`r-${item}`} className="text-danger/90">
              <span className="select-none text-muted">- </span>
              {item}
            </p>
          ))}
          {section.after ? (
            <p className="text-success">
              <span className="select-none text-muted">+ </span>
              {section.after}
            </p>
          ) : null}
          {section.addedItems?.map((item) => (
            <p key={`a-${item}`} className="text-success">
              <span className="select-none text-muted">+ </span>
              {item}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
