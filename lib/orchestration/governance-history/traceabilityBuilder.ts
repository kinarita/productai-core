import type { DecisionAttentionItem } from "@/lib/orchestration/decision-attention/decisionAttention";
import type { ExecutiveGovernanceNarrative } from "@/lib/orchestration/governance-history/governanceNarratives";
import type { GovernanceJournalEntry } from "@/lib/orchestration/governance-history/governanceJournal";
import type { ReplayInterpretationRecord } from "@/lib/orchestration/governance-history/replayInterpretationHistory";
import type { ExecutiveReviewJourney } from "@/lib/orchestration/governance-history/reviewJourney";
import type { DecisionMemoryAtlas } from "@/lib/orchestration/governance-history/decisionMemoryAtlas";
import type { KnowledgeGraph } from "@/lib/orchestration/governance-history/governanceKnowledgeGraph";
import {
  createDecisionPathway,
  type DecisionPathway,
} from "@/lib/orchestration/governance-history/decisionPathways";
import type {
  DecisionTraceability,
  DecisionTraceEdge,
  DecisionTraceNode,
  DecisionTraceNodeType,
  DecisionTraceRelationshipType,
} from "@/lib/orchestration/governance-history/decisionTraceability";

const traceTypes = new Set<DecisionTraceNodeType>([
  "mission",
  "attention",
  "interpretation",
  "journal",
  "narrative",
  "journey",
  "decision_theme",
  "executive_role",
]);

function edgeId(sourceId: string, targetId: string, relationshipType: string): string {
  return `trace-${sourceId}-${targetId}-${relationshipType}`;
}

function addEdge(
  edges: DecisionTraceEdge[],
  seen: Set<string>,
  sourceId: string,
  targetId: string,
  relationshipType: DecisionTraceRelationshipType
) {
  const id = edgeId(sourceId, targetId, relationshipType);
  if (seen.has(id) || sourceId === targetId) return;
  seen.add(id);
  edges.push({ id, sourceId, targetId, relationshipType });
}

function mapAtlasRelationship(
  rel: string
): DecisionTraceRelationshipType {
  switch (rel) {
    case "continues":
      return "continued_by";
    case "references":
      return "referenced_by";
    case "themes":
      return "influenced_by";
    case "supports":
      return "reviewed_with";
    default:
      return "connected_to";
  }
}

function mapGraphRelationship(rel: string): DecisionTraceRelationshipType {
  switch (rel) {
    case "continues":
      return "continued_by";
    case "interprets":
      return "derived_from";
    case "references":
      return "referenced_by";
    case "influences":
      return "influenced_by";
    case "reviews":
      return "reviewed_with";
    case "supports":
      return "reviewed_with";
    default:
      return "connected_to";
  }
}

function buildPathFromNodes(
  nodes: DecisionTraceNode[],
  titlePrefix: string
): DecisionPathway | null {
  const sorted = [...nodes].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (sorted.length < 2) return null;
  return createDecisionPathway({
    title: `${titlePrefix}: ${sorted[0].title.slice(0, 40)} → ${sorted[sorted.length - 1].title.slice(0, 40)}`,
    nodeIds: sorted.map((n) => n.id),
    continuityNote:
      "This pathway illustrates how governance interpretations became connected over time.",
  });
}

export function buildDecisionTraceability(input: {
  atlas: DecisionMemoryAtlas;
  graph: KnowledgeGraph;
  narratives: ExecutiveGovernanceNarrative[];
  journals: GovernanceJournalEntry[];
  interpretations: ReplayInterpretationRecord[];
  journeys: ExecutiveReviewJourney[];
  decisionAttention: DecisionAttentionItem[];
}): DecisionTraceability {
  const nodes: DecisionTraceNode[] = [];
  const edges: DecisionTraceEdge[] = [];
  const seenEdges = new Set<string>();
  const nodeIndex = new Set<string>();

  const pushNode = (node: DecisionTraceNode) => {
    if (nodeIndex.has(node.id)) return;
    nodeIndex.add(node.id);
    nodes.push(node);
  };

  for (const atlasNode of input.atlas.nodes) {
    if (!traceTypes.has(atlasNode.type as DecisionTraceNodeType)) continue;
    pushNode({
      id: atlasNode.id,
      type: atlasNode.type as DecisionTraceNodeType,
      title: atlasNode.title,
      description: atlasNode.description,
      createdAt: atlasNode.createdAt,
      missionId: atlasNode.missionId,
      themeIds: atlasNode.themeIds,
    });
  }

  for (const atlasEdge of input.atlas.edges) {
    if (!nodeIndex.has(atlasEdge.sourceId) || !nodeIndex.has(atlasEdge.targetId)) continue;
    addEdge(
      edges,
      seenEdges,
      atlasEdge.sourceId,
      atlasEdge.targetId,
      mapAtlasRelationship(atlasEdge.relationshipType)
    );
  }

  for (const graphEdge of input.graph.edges) {
    const sourceInAtlas = nodeIndex.has(graphEdge.sourceId);
    const targetInAtlas = nodeIndex.has(graphEdge.targetId);
    if (!sourceInAtlas && traceTypes.has(graphEdge.sourceId as DecisionTraceNodeType)) {
      const gn = input.graph.nodes.find((n) => n.id === graphEdge.sourceId);
      if (gn && traceTypes.has(gn.type as DecisionTraceNodeType)) {
        pushNode({
          id: gn.id,
          type: gn.type as DecisionTraceNodeType,
          title: gn.title,
          description: gn.description,
          createdAt: gn.createdAt,
          missionId: gn.missionId,
        });
      }
    }
    if (!targetInAtlas && traceTypes.has(graphEdge.targetId as DecisionTraceNodeType)) {
      const gn = input.graph.nodes.find((n) => n.id === graphEdge.targetId);
      if (gn && traceTypes.has(gn.type as DecisionTraceNodeType)) {
        pushNode({
          id: gn.id,
          type: gn.type as DecisionTraceNodeType,
          title: gn.title,
          description: gn.description,
          createdAt: gn.createdAt,
          missionId: gn.missionId,
        });
      }
    }
    if (nodeIndex.has(graphEdge.sourceId) && nodeIndex.has(graphEdge.targetId)) {
      addEdge(
        edges,
        seenEdges,
        graphEdge.sourceId,
        graphEdge.targetId,
        mapGraphRelationship(graphEdge.relationshipType)
      );
    }
  }

  const pathways: DecisionPathway[] = [];

  for (const narrative of input.narratives) {
    const chainIds: string[] = [narrative.id];
    for (const interpretationId of narrative.relatedInterpretations) {
      if (nodeIndex.has(interpretationId)) chainIds.push(interpretationId);
    }
    for (const journalId of narrative.relatedJournals) {
      if (nodeIndex.has(journalId)) chainIds.push(journalId);
    }
    const attentionJournal = input.journals.find(
      (j) => narrative.relatedJournals.includes(j.id) && j.relatedAttentionId
    );
    if (attentionJournal?.relatedAttentionId && nodeIndex.has(attentionJournal.relatedAttentionId)) {
      chainIds.push(attentionJournal.relatedAttentionId);
    }
    if (attentionJournal?.relatedMissionId && nodeIndex.has(attentionJournal.relatedMissionId)) {
      chainIds.push(attentionJournal.relatedMissionId);
    }
    const uniqueChain = [...new Set(chainIds)];
    const pathway = createDecisionPathway({
      title: `Narrative pathway · ${narrative.title.slice(0, 50)}`,
      nodeIds: uniqueChain,
    });
    if (pathway) pathways.push(pathway);
  }

  const sortedInterpretations = [...input.interpretations].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );
  for (let i = 1; i < sortedInterpretations.length; i += 1) {
    const prev = sortedInterpretations[i - 1];
    const curr = sortedInterpretations[i];
    if (!nodeIndex.has(prev.id) || !nodeIndex.has(curr.id)) continue;
    const pathway = createDecisionPathway({
      title: `Interpretation continuity · ${prev.createdAt.slice(0, 10)}`,
      nodeIds: [prev.id, curr.id],
      continuityNote: "Interpretation sessions linked for executive re-reading.",
    });
    if (pathway) pathways.push(pathway);
  }

  for (const journey of input.journeys) {
    const chain = [
      journey.id,
      ...journey.recentInterpretations.filter((id) => nodeIndex.has(id)),
      ...journey.recentJournals.filter((id) => nodeIndex.has(id)),
    ];
    const pathway = createDecisionPathway({
      title: journey.title,
      nodeIds: [...new Set(chain)],
      continuityNote: journey.continuityFocus,
    });
    if (pathway) pathways.push(pathway);
  }

  const themeNodes = nodes.filter((n) => n.type === "decision_theme");
  const interpretationNodes = nodes.filter((n) => n.type === "interpretation");
  if (themeNodes[0] && interpretationNodes.length >= 1) {
    const path = buildPathFromNodes(
      [themeNodes[0], ...interpretationNodes.slice(0, 3)],
      "Theme to interpretation"
    );
    if (path) pathways.push(path);
  }

  const attentionNodes = nodes.filter((n) => n.type === "attention");
  for (const attention of attentionNodes.slice(0, 4)) {
    const missionId = attention.missionId;
    if (missionId && nodeIndex.has(missionId)) {
      const pathway = createDecisionPathway({
        title: `Attention influence · ${attention.title.slice(0, 40)}`,
        nodeIds: [attention.id, missionId],
        continuityNote: "Attention context linked to mission for explainability reading.",
      });
      if (pathway) pathways.push(pathway);
    }
  }

  return {
    nodes,
    edges,
    pathways: pathways.slice(0, 24),
    generatedAt: new Date().toISOString(),
  };
}

export function collectPathwayIdsForEntity(
  pathways: DecisionPathway[],
  entityId: string
): string[] {
  return pathways.filter((p) => p.nodeIds.includes(entityId)).map((p) => p.id);
}
