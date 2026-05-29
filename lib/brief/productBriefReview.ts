import type { ProductBriefRecord } from "@/lib/brief/productBriefWorkspace";
import { buildProductBrief } from "@/lib/idea/productBrief";
import { buildProductIdeas } from "@/lib/idea/ideaAnalysis";
import type { Mission } from "@/types/productai";
import { getCommentsForArtifact } from "@/lib/review/reviewComments";
import { briefArtifactId } from "@/lib/brief/productBriefWorkspace";

export interface ProductBriefReviewContext {
  plannerNotes: string[];
  openQuestions: string[];
  reviewNotes: string[];
  changesRequested: string[];
  reviewHistory: Array<{ label: string; at: string; detail: string }>;
}

export function buildProductBriefReviewContext(input: {
  brief: ProductBriefRecord;
  missions: Mission[];
}): ProductBriefReviewContext {
  const idea = buildProductIdeas(input.missions).find(
    (i) => i.ideaId === input.brief.ideaId || i.relatedMissionId === input.brief.missionId
  );

  const doc = idea ? buildProductBrief(idea) : null;

  const artifactComments = input.brief.missionId
    ? getCommentsForArtifact(briefArtifactId(input.brief.missionId))
    : [];

  const changesRequested: string[] = [];
  if (input.brief.status === "changes_requested") {
    changesRequested.push("Unresolved feedback recorded—revision suggested before re-requesting review.");
  }
  artifactComments
    .filter((c) => c.severity === "concern")
    .forEach((c) => changesRequested.push(c.title + ": " + c.comment));

  const reviewHistory: ProductBriefReviewContext["reviewHistory"] = [
    {
      label: "Draft Created",
      at: input.brief.createdAt,
      detail: "Product Brief draft created by Product Planner organization.",
    },
  ];

  if (
    input.brief.status !== "draft" &&
    input.brief.status !== "archived"
  ) {
    reviewHistory.push({
      label: "Review Requested",
      at: input.brief.updatedAt,
      detail: "Review requested for CEO and stakeholder reading.",
    });
  }

  artifactComments.forEach((c) => {
    reviewHistory.push({
      label: "Review Updated",
      at: c.createdAt,
      detail: `${c.authorRole}: ${c.title}`,
    });
  });

  if (input.brief.status === "changes_requested") {
    reviewHistory.push({
      label: "Changes Requested",
      at: input.brief.updatedAt,
      detail: "Changes requested—human revision before approval.",
    });
  }

  return {
    plannerNotes: input.brief.plannerNotes,
    openQuestions: doc?.openQuestions ?? [],
    reviewNotes: [
      ...input.brief.reviewNotes,
      ...artifactComments.map((c) => `${c.authorRole}: ${c.comment}`),
    ],
    changesRequested,
    reviewHistory,
  };
}
