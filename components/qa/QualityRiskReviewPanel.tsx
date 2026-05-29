"use client";

import type { QualityRiskReviewView } from "@/lib/qa/qualityRiskReview";

export function QualityRiskReviewPanel({ review }: { review: QualityRiskReviewView }) {
  return (
    <div className="space-y-4 text-sm">
      <p className="text-xs text-muted">{review.advisoryNote}</p>
      <ListSection title="Quality Risks" items={review.qualityRisks} />
      <ListSection title="Validation Gaps" items={review.validationGaps} />
      <ListSection title="Integration Concerns" items={review.integrationConcerns} />
      <ListSection title="Regression Concerns" items={review.regressionConcerns} />
      <ListSection title="Open QA Questions" items={review.openQaQuestions} />
    </div>
  );
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-medium text-foreground">{title}</p>
      {items.length ? (
        <ul className="mt-1 list-inside list-disc text-xs text-muted">
          {items.map((item, i) => (
            <li key={`${title}-${i}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-xs text-muted">—</p>
      )}
    </div>
  );
}

