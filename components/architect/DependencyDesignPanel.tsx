"use client";

import type { DependencyDesignView } from "@/lib/architect/dependencyDesign";

export function DependencyDesignPanel({ design }: { design: DependencyDesignView }) {
  return (
    <div className="space-y-4 text-sm">
      <ListSection title="Internal Dependencies" items={design.internalDependencies} />
      <ListSection title="External Dependencies" items={design.externalDependencies} />
      <ListSection title="Risks" items={design.risks} />
      <ListSection title="Review Areas" items={design.reviewAreas} />
      <p className="text-[10px] text-muted">Dependency visibility only—no automatic analysis.</p>
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
