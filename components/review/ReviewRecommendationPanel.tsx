"use client";

import type { ReviewRecommendation } from "@/lib/review/reviewRecommendations";

export function ReviewRecommendationPanel({
  recommendations,
}: {
  recommendations: ReviewRecommendation[];
}) {
  if (recommendations.length === 0) {
    return (
      <p className="text-xs text-muted">
        No review recommendations for the current filters—recommendations are advisory only.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {recommendations.map((rec) => (
        <li key={rec.id} className="rounded-lg border border-border bg-muted/5 px-3 py-2">
          <p className="text-[10px] uppercase text-muted">{rec.artifactTitle}</p>
          <p className="mt-1 text-xs text-foreground">{rec.message}</p>
        </li>
      ))}
    </ul>
  );
}
