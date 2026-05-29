"use client";

import Link from "next/link";
import type { ArtifactInspectorView } from "@/lib/lineage/artifactInspector";

export function ArtifactInspectorPanel({ inspector }: { inspector: ArtifactInspectorView }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-lg border border-border px-3 py-2">
        <p className="text-[10px] uppercase text-muted">{inspector.artifactName}</p>
        <p className="mt-1 text-xs text-muted">Status: {inspector.status}</p>
        <p className="mt-2 text-xs">{inspector.summary}</p>
        <p className="mt-1 text-[10px] text-muted">Mission: {inspector.relatedMission}</p>
      </div>

      <ListSection title="Related Reviews" items={inspector.relatedReviews} />
      <div>
        <p className="text-xs font-medium text-foreground">Related Feed Events</p>
        {inspector.relatedFeedEvents.length ? (
          <ul className="mt-1 space-y-2">
            {inspector.relatedFeedEvents.map((e) => (
              <li key={e.id} className="rounded-lg border border-border px-3 py-2 text-xs text-muted">
                <span className="font-medium text-foreground">{e.label}</span>
                <p className="mt-0.5">{e.message}</p>
                <p className="text-[10px]">{e.timestamp}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-xs text-muted">No related feed events in view.</p>
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-foreground">Related Workspaces</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {inspector.relatedWorkspaces.map((w) => (
            <Link
              key={w.href}
              href={w.href}
              className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline"
            >
              {w.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-medium text-foreground">{title}</p>
      <ul className="mt-1 list-inside list-disc text-xs text-muted">
        {items.map((item, i) => (
          <li key={`${title}-${i}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
