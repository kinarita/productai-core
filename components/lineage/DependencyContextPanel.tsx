"use client";

import type { DependencyContextView } from "@/lib/lineage/dependencyContext";

export function DependencyContextPanel({ view }: { view: DependencyContextView }) {
  return (
    <div className="space-y-4 text-sm">
      <p className="text-xs text-muted">{view.advisoryNote}</p>
      <div className="rounded-lg border border-border px-3 py-2">
        <p className="text-[10px] uppercase text-muted">Selected Artifact</p>
        <p className="text-sm font-medium">{view.artifactName}</p>
      </div>
      <Pair label="Parent Artifact" value={view.parentArtifact ?? "—"} />
      <Pair label="Child Artifact" value={view.childArtifact ?? "—"} />
      <Pair label="Related Lifecycle Stage" value={view.relatedLifecycleStage} />
      <ListSection title="Related Reviews" items={view.relatedReviews} />
    </div>
  );
}

function Pair({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-foreground">{label}</p>
      <p className="mt-1 text-xs text-muted">{value}</p>
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
