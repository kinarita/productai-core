import type { Mission, OrganizationFeedItem, Task } from "@/types/productai";
import type { LineageChainNode } from "@/lib/lineage/artifactChain";
import { buildDependencyContext } from "@/lib/lineage/dependencyContext";
import { buildReviewTraceability } from "@/lib/lineage/reviewTraceability";
import { displayNameForStep } from "@/lib/lineage/teamOwnership";

export interface ArtifactInspectorView {
  artifactName: string;
  summary: string;
  status: string;
  relatedMission: string;
  relatedReviews: string[];
  relatedFeedEvents: Array<{ id: string; label: string; message: string; timestamp: string }>;
  relatedWorkspaces: Array<{ label: string; href: string }>;
}

const lineageFeedTypes = new Set([
  "artifact_created",
  "artifact_review_requested",
  "artifact_approved",
  "artifact_returned",
  "artifact_handed_off",
  "artifact_review_snapshot",
  "product_brief_created",
  "director_plan_created",
  "technical_specification_created",
  "design_specification_created",
  "implementation_plan_created",
  "test_plan_created",
  "artifact_lineage_created",
  "artifact_lineage_updated",
  "artifact_lineage_reviewed",
  "artifact_lineage_snapshot",
]);

export function buildArtifactInspector(input: {
  mission: Mission;
  tasks: Task[];
  feedItems: OrganizationFeedItem[];
  selected: LineageChainNode;
}): ArtifactInspectorView {
  const dependency = buildDependencyContext({
    mission: input.mission,
    tasks: input.tasks,
    selected: input.selected,
  });
  const review = buildReviewTraceability({
    mission: input.mission,
    tasks: input.tasks,
    selected: input.selected,
  });

  const relatedFeed = input.feedItems
    .filter((f) => f.missionId === input.mission.id && lineageFeedTypes.has(f.type))
    .slice(0, 6)
    .map((f) => ({
      id: f.id,
      label: f.type.replaceAll("_", " "),
      message: f.message,
      timestamp: f.timestamp,
    }));

  const workspaces: Array<{ label: string; href: string }> = [
    { label: `${displayNameForStep(input.selected.stepId)} Workspace`, href: input.selected.workspaceHref },
    { label: "Artifact Review", href: input.selected.artifactReviewHref },
    { label: "Artifact Lineage", href: input.selected.lineageHref },
    { label: "Mission Detail", href: `/missions/${input.mission.id}` },
  ];

  return {
    artifactName: input.selected.artifactName,
    summary: input.selected.summary,
    status: input.selected.status,
    relatedMission: input.mission.name,
    relatedReviews: [...dependency.relatedReviews, ...review.approvalContext.slice(0, 2)],
    relatedFeedEvents: relatedFeed,
    relatedWorkspaces: workspaces,
  };
}
