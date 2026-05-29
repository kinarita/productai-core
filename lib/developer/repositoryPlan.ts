import type { Mission } from "@/types/productai";

export interface RepositoryPlanView {
  repositoryStructure: string[];
  branchStrategy: string[];
  reviewStrategy: string[];
  documentationStrategy: string[];
}

export function buildRepositoryPlan(mission: Mission): RepositoryPlanView {
  const branches = mission.relatedBranches.length
    ? mission.relatedBranches
    : ["main", `feature/${mission.id}-planning`];

  return {
    repositoryStructure: [
      "app/ — Next.js routes and workspace pages",
      "components/ — role workspaces and shared UI",
      "lib/ — analysis builders, stores, hooks",
      "docs/ — phase documentation and specs",
      "data/mockData.ts — continuity seeds (not production execution)",
    ],
    branchStrategy: [
      `Primary: ${branches[0]} — human-managed merges only.`,
      "Feature branches named per mission—no automatic branch creation.",
      "Planning branches do not trigger CI/CD or deployment.",
    ],
    reviewStrategy: [
      "Artifact Review for implementation_plan before QA planning consideration.",
      "Pull request review is human-led—ProductAI does not open or merge PRs.",
      "Architecture and Design review context linked from upstream workspaces.",
    ],
    documentationStrategy: [
      "PHASE9_* workspace docs for continuity reading.",
      "Implementation plan visible in Developer Workspace and Artifact Review.",
      "Forbidden messaging avoided (auto merge, auto deploy, AI approved).",
    ],
  };
}
