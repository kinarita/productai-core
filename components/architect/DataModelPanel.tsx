"use client";

import type { DataModelEntity } from "@/lib/architect/dataModel";

export function DataModelPanel({ entities }: { entities: DataModelEntity[] }) {
  return (
    <ul className="space-y-2">
      {entities.map((entity) => (
        <li key={entity.name} className="rounded-lg border border-border px-3 py-2 text-xs">
          <p className="font-medium text-foreground">{entity.name}</p>
          <p className="mt-1 text-muted">{entity.description}</p>
          <p className="mt-1 text-[10px] text-muted">
            Relationships: {entity.relationships.join(", ")}
          </p>
        </li>
      ))}
    </ul>
  );
}
