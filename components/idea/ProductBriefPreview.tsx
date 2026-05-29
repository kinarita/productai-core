"use client";

import Link from "next/link";
import type { ProductBriefDocument } from "@/lib/idea/productBrief";
import type { ProductIdea } from "@/lib/idea/ideaWorkspace";

export function ProductBriefPreview({
  brief,
  idea,
}: {
  brief: ProductBriefDocument;
  idea: ProductIdea;
}) {
  const reviewHref = idea.relatedMissionId
    ? `/artifact-review?mission=${idea.relatedMissionId}&artifact=${idea.relatedMissionId}-product_brief`
    : "/artifact-review";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-foreground">{brief.title}</p>
          <p className="text-[10px] uppercase text-muted">{brief.statusLabel}</p>
        </div>
        {idea.relatedMissionId ? (
          <Link href={reviewHref} className="text-xs text-accent hover:underline">
            Open Review →
          </Link>
        ) : null}
      </div>

      <BriefSection title="Product Vision" content={brief.productVision} />
      <BriefSection title="User Problem" content={brief.userProblem} />
      <BriefSection title="Target Users" content={brief.targetUsers} />
      <BriefSection title="Value Proposition" content={brief.valueProposition} />
      <BriefSection title="MVP Scope" content={brief.mvpScope} pre />
      <BriefList title="Feature Candidates" items={brief.featureCandidates} />
      <BriefList title="Open Questions" items={brief.openQuestions} />
      <BriefList title="Review Notes" items={brief.reviewNotes} />
    </div>
  );
}

function BriefSection({
  title,
  content,
  pre,
}: {
  title: string;
  content: string;
  pre?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border px-3 py-2">
      <p className="text-[10px] uppercase text-muted">{title}</p>
      <p className={`mt-1 text-xs text-foreground ${pre ? "whitespace-pre-line" : ""}`}>{content}</p>
    </div>
  );
}

function BriefList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-lg border border-border px-3 py-2">
      <p className="text-[10px] uppercase text-muted">{title}</p>
      <ul className="mt-1 space-y-0.5 text-xs text-muted">
        {items.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
    </div>
  );
}
