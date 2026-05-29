import type { Mission, Task, Branch, PullRequest, ReleaseItem } from "@/types/productai";
import { buildReviewCoordinationSummary } from "@/lib/repository/reviewCoordination";
import { buildReleaseCoordinationView } from "@/lib/repository/releaseCoordination";

export interface RepositoryBoardItem {
  repositoryId: string;
  repositoryLabel: string;
  missionId: string;
  missionName: string;
  relatedTasks: string[];
  branches: string[];
  pullRequests: string[];
  reviewState: string;
  releaseState: string;
}

export interface BranchOverviewRow {
  branchName: string;
  relatedTask: string;
  missionId: string;
  missionName: string;
  status: string;
  updatedAt: string;
}

export interface RepositoryOverviewSummary {
  repositories: number;
  pullRequests: number;
  reviews: number;
  releaseCandidates: number;
  potentialCoordinationAreas: string[];
  missionCount: number;
  taskCount: number;
  advisoryNote: string;
}

export interface RepositoryBottleneckObservation {
  id: string;
  missionId: string;
  missionName: string;
  category: "draft_dwell" | "review_stall" | "branch_stale" | "release_candidate_stall";
  label: string;
  detail: string;
}

function inferBranchStatus(branch: Branch): string {
  if (branch.behind > 3) return "behind main";
  if (branch.ahead > 8) return "active development";
  if (branch.ahead > 0) return "in sync";
  return "stable";
}

function linkTaskToBranch(branch: Branch, tasks: Task[]): string {
  const missionTasks = tasks.filter((t) => t.missionId === branch.relatedMissionId);
  const byBranch = missionTasks.find((t) =>
    branch.lastCommit.toLowerCase().includes(t.title.split(" ")[0]?.toLowerCase() ?? "")
  );
  if (byBranch) return byBranch.title;
  const active = missionTasks.find((t) => t.status === "active" || t.status === "in_review");
  return active?.title ?? missionTasks[0]?.title ?? "—";
}

export function buildRepositoryBoard(input: {
  missions: Mission[];
  tasks: Task[];
  branches: Branch[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
}): RepositoryBoardItem[] {
  return input.missions
    .filter((m) => m.status !== "completed")
    .map((mission) => {
      const missionBranches = input.branches.filter(
        (b) => b.relatedMissionId === mission.id || mission.relatedBranches.includes(b.name)
      );
      const missionPrs = input.pullRequests.filter((pr) => pr.relatedMissionId === mission.id);
      const missionTasks = input.tasks.filter((t) => t.missionId === mission.id);
      const review = buildReviewCoordinationSummary({
        tasks: input.tasks,
        pullRequests: input.pullRequests,
        missionId: mission.id,
      });
      const release = input.releases.find((r) => r.relatedMissionId === mission.id);
      const releaseState = release
        ? `${release.state} · ${release.version}`
        : mission.releaseReadiness?.label ?? "No candidate";

      return {
        repositoryId: mission.id,
        repositoryLabel: `${mission.name} repository context`,
        missionId: mission.id,
        missionName: mission.name,
        relatedTasks: missionTasks.map((t) => t.title),
        branches: missionBranches.map((b) => b.name),
        pullRequests: missionPrs.map((pr) => `#${pr.number} ${pr.title}`),
        reviewState: `${review.activeReviews} active · ${review.pendingReviews} pending`,
        releaseState,
      };
    });
}

export function buildBranchOverview(input: {
  branches: Branch[];
  tasks: Task[];
  commits: { branch: string; timestamp: string }[];
  missionId?: string | null;
}): BranchOverviewRow[] {
  const filtered = input.missionId
    ? input.branches.filter((b) => b.relatedMissionId === input.missionId)
    : input.branches.filter((b) => b.relatedMissionId);

  return filtered.map((branch) => {
    const commit = input.commits.find((c) => c.branch === branch.name);
    return {
      branchName: branch.name,
      relatedTask: linkTaskToBranch(branch, input.tasks),
      missionId: branch.relatedMissionId ?? "",
      missionName: branch.missionName,
      status: inferBranchStatus(branch),
      updatedAt: commit?.timestamp ?? `${branch.ahead} ahead · ${branch.behind} behind`,
    };
  });
}

export function buildRepositoryOverviewSummary(input: {
  missions: Mission[];
  tasks: Task[];
  branches: Branch[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
}): RepositoryOverviewSummary {
  const missionRepos = input.missions.filter(
    (m) => m.relatedBranches.length > 0 || m.status === "active" || m.status === "planning"
  );
  const prs = input.pullRequests;
  const reviewCount = prs.reduce((sum, pr) => sum + pr.reviews, 0);
  const candidates = input.releases.filter(
    (r) => r.state === "candidate" || r.state === "staging"
  );

  const areas: string[] = [];
  const drafts = prs.filter((pr) => pr.status === "draft");
  if (drafts.length > 0) {
    areas.push(`${drafts.length} pull request(s) in draft may benefit from coordination`);
  }
  const openReview = prs.filter((pr) => pr.status === "open" && pr.reviews > 0);
  if (openReview.length >= 2) {
    areas.push("Several pull requests remain in review and may benefit from additional coordination.");
  }
  if (candidates.length > 0) {
    areas.push(`${candidates.length} release candidate(s) for readiness reading`);
  }

  return {
    repositories: missionRepos.length,
    pullRequests: prs.length,
    reviews: reviewCount,
    releaseCandidates: candidates.length,
    potentialCoordinationAreas: areas,
    missionCount: input.missions.filter((m) => m.status !== "completed").length,
    taskCount: input.tasks.filter((t) => t.status !== "completed").length,
    advisoryNote:
      "Repository coordination highlights branch, PR, and release continuity—no repository operations performed.",
  };
}

export function detectRepositoryBottlenecks(input: {
  branches: Branch[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
  commits: { branch: string; timestamp: string }[];
}): RepositoryBottleneckObservation[] {
  const observations: RepositoryBottleneckObservation[] = [];

  for (const pr of input.pullRequests.filter((p) => p.status === "draft")) {
    observations.push({
      id: `rb-draft-${pr.id}`,
      missionId: pr.relatedMissionId ?? "",
      missionName: pr.missionName ?? "—",
      category: "draft_dwell",
      label: "Review suggested",
      detail: `PR #${pr.number} remains in draft. Coordination reading may help move review forward—no merge or PR creation.`,
    });
  }

  const inReview = input.pullRequests.filter(
    (p) => p.status === "open" && p.reviews > 0 && p.reviews < 2
  );
  if (inReview.length >= 2) {
    observations.push({
      id: "rb-review-stall",
      missionId: inReview[0].relatedMissionId ?? "",
      missionName: inReview[0].missionName ?? "—",
      category: "review_stall",
      label: "Potential coordination bottleneck",
      detail:
        "Several pull requests remain in review and may benefit from additional coordination.",
    });
  }

  for (const branch of input.branches.filter((b) => b.behind > 2 && b.relatedMissionId)) {
    const stale = input.commits.find((c) => c.branch === branch.name);
    if (!stale || /day|week/.test(stale.timestamp)) {
      observations.push({
        id: `rb-branch-${branch.name}`,
        missionId: branch.relatedMissionId!,
        missionName: branch.missionName,
        category: "branch_stale",
        label: "Review suggested",
        detail: `Branch ${branch.name} may be behind main (${branch.behind} behind). Branch update visibility only.`,
      });
    }
  }

  for (const release of input.releases.filter((r) => r.state === "candidate")) {
    observations.push({
      id: `rb-release-${release.id}`,
      missionId: release.relatedMissionId,
      missionName: release.missionName,
      category: "release_candidate_stall",
      label: "Review suggested",
      detail: `Release candidate ${release.version} on ${release.branch} may benefit from release coordination reading.`,
    });
  }

  return observations.slice(0, 8);
}
