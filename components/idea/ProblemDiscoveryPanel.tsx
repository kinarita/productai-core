"use client";

import type { ProblemDiscovery } from "@/lib/idea/problemDiscovery";

export function ProblemDiscoveryPanel({ discovery }: { discovery: ProblemDiscovery }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Detail label="Target Users" value={discovery.targetUsers} />
        <Detail label="Core Problem" value={discovery.coreProblem} />
        <Detail label="Current Alternatives" value={discovery.currentAlternatives} className="sm:col-span-2" />
      </div>
      <ListSection title="Pain Points" items={discovery.painPoints} />
      <ListSection title="Opportunity Areas" items={discovery.opportunityAreas} />
    </div>
  );
}

function Detail({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[10px] uppercase text-muted">{label}</p>
      <p className="mt-1 text-xs text-foreground">{value}</p>
    </div>
  );
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted">{title}</p>
      <ul className="mt-1 space-y-0.5 text-xs text-muted">
        {items.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
    </div>
  );
}
