"use client";

import Link from "next/link";
import type { DesignSpecificationRecord } from "@/lib/designer/designSpecification";

export function DesignSpecificationPanel({ spec }: { spec: DesignSpecificationRecord }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-medium text-foreground">{spec.title}</p>
        <Link href={spec.artifactReviewHref} className="text-xs text-accent hover:underline">
          Open Artifact Review →
        </Link>
      </div>
      <ListSection title="Design Principles" items={spec.designPrinciples} />
      <ListSection title="Layout Guidelines" items={spec.layoutGuidelines} />
      <ListSection title="Navigation Guidelines" items={spec.navigationGuidelines} />
      <ListSection title="Interaction Guidelines" items={spec.interactionGuidelines} />
      <ListSection title="Accessibility Guidelines" items={spec.accessibilityGuidelines} />
      <p className="text-[10px] text-muted">Display only—no Figma or code generation.</p>
    </div>
  );
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-[10px] uppercase text-muted">{title}</p>
      <ul className="mt-1 list-inside list-disc text-xs text-muted">
        {items.map((item, i) => (
          <li key={`${title}-${i}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
