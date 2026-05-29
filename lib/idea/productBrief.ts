import type { ProductIdea } from "@/lib/idea/ideaWorkspace";
import { buildProblemDiscovery } from "@/lib/idea/problemDiscovery";
import { buildValueProposition } from "@/lib/idea/valueProposition";
import { buildMvpScope } from "@/lib/idea/mvpScoping";
import { buildFeaturePrioritization } from "@/lib/idea/featurePrioritization";

export interface ProductBriefDocument {
  ideaId: string;
  title: string;
  productVision: string;
  userProblem: string;
  targetUsers: string;
  valueProposition: string;
  mvpScope: string;
  featureCandidates: string[];
  openQuestions: string[];
  reviewNotes: string[];
  updatedAt: string;
  statusLabel: string;
}

export function buildProductBrief(idea: ProductIdea): ProductBriefDocument {
  const problem = buildProblemDiscovery(idea);
  const value = buildValueProposition(idea);
  const mvp = buildMvpScope(idea);
  const features = buildFeaturePrioritization(idea);

  const mvpScopeText = [
    `Must Have: ${mvp.mustHave.join("; ")}`,
    `Should Have: ${mvp.shouldHave.join("; ")}`,
    `Could Have: ${mvp.couldHave.join("; ")}`,
    `Out of Scope: ${mvp.outOfScope.join("; ")}`,
  ].join("\n");

  const openQuestions: string[] = [];
  if (idea.status === "exploring" || idea.status === "refining") {
    openQuestions.push("This opportunity may benefit from additional market exploration.");
  }
  if (idea.tags.includes("analytics")) {
    openQuestions.push("Which partitioning option aligns with Q2 metrics goals and budget?");
  }
  if (idea.relatedMissionId) {
    openQuestions.push(`How does this brief align with mission ${idea.relatedMissionName ?? idea.relatedMissionId}?`);
  }

  const reviewNotes: string[] = [];
  if (idea.status === "product_brief_draft" || idea.status === "ready_for_review") {
    reviewNotes.push("The Product Brief draft is ready for review—human authorization required.");
  }
  if (idea.status === "approved") {
    reviewNotes.push("CEO authorization recorded—Director hand-off may be considered when stakeholders align.");
  }
  idea.notes.forEach((n) => reviewNotes.push(n));

  return {
    ideaId: idea.ideaId,
    title: `${idea.title} — Product Brief`,
    productVision: `Deliver ${idea.title} with clear MVP boundaries and executive-readable planning—CEO approves, Planner organizes.`,
    userProblem: problem.coreProblem,
    targetUsers: problem.targetUsers,
    valueProposition: `${value.expectedValue} Differentiation: ${value.differentiation}`,
    mvpScope: mvpScopeText,
    featureCandidates: features.slice(0, 6).map((f) => `${f.priority}: ${f.feature} — ${f.reason}`),
    openQuestions,
    reviewNotes,
    updatedAt: idea.updatedAt,
    statusLabel: idea.status.replaceAll("_", " "),
  };
}

export function productBriefArtifactId(missionId: string): string {
  return `${missionId}-product_brief`;
}
