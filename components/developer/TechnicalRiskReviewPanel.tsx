"use client";

import type { TechnicalRiskReviewView } from "@/lib/developer/technicalRiskReview";

export function TechnicalRiskReviewPanel({ risks }: { risks: TechnicalRiskReviewView }) {
  return (
    <div className="space-y-4 text-sm">
      <ListSection title="Technical Risks" items={risks.technicalRisks} />
      <ListSection title="Complexity Areas" items={risks.complexityAreas} />
      <ListSection title="Integration Risks" items={risks.integrationRisks} />
      <ListSection title="Dependency Risks" items={risks.dependencyRisks} />
      <ListSection title="Open Technical Questions" items={risks.openTechnicalQuestions} />
      <p className="text-[10px] text-muted">Recommendation only—no automatic risk scoring.</p>
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
