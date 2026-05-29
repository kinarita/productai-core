export type RepositoryWorkspaceViewId =
  | "board"
  | "branches"
  | "pull_requests"
  | "review"
  | "release"
  | "summary"
  | "context";

export const repositoryWorkspaceAdvisoryNote =
  "Repository coordination provides visibility into branches, pull requests, and release context. No GitHub execution, PR creation, merge, or repository operations.";
