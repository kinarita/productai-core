import type {
  KnowledgeGraph,
  KnowledgeGraphNode,
  KnowledgeGraphNodeType,
} from "@/lib/orchestration/governance-history/governanceKnowledgeGraph";

export interface KnowledgeGraphSummary {
  mostConnectedMissions: Array<{ id: string; title: string; connectionCount: number }>;
  mostReferencedInterpretations: Array<{ id: string; title: string; referenceCount: number }>;
  recurringGovernanceThemes: string[];
  activeAttentionClusters: Array<{ id: string; title: string; missionId?: string }>;
  executiveReviewHotspots: Array<{ roleTitle: string; connectionCount: number }>;
  connectedThemes: string[];
  activeReviewAreas: string[];
  continuityClusters: string[];
  executiveParticipation: string[];
  advisoryNote: string;
}

export interface NodeRelationshipInspection {
  node: KnowledgeGraphNode;
  relatedMissions: KnowledgeGraphNode[];
  relatedJournals: KnowledgeGraphNode[];
  relatedNarratives: KnowledgeGraphNode[];
  relatedAttention: KnowledgeGraphNode[];
  relatedReplay: KnowledgeGraphNode[];
  relatedInterpretations: KnowledgeGraphNode[];
  relatedTasks: KnowledgeGraphNode[];
  relatedExecutiveRoles: KnowledgeGraphNode[];
  connectedEdges: KnowledgeGraph["edges"];
}

export interface MissionRelationshipView {
  missionId: string;
  missionTitle: string;
  narratives: KnowledgeGraphNode[];
  journals: KnowledgeGraphNode[];
  attention: KnowledgeGraphNode[];
  interpretations: KnowledgeGraphNode[];
  replay: KnowledgeGraphNode[];
  executiveRoles: KnowledgeGraphNode[];
  summaryNote: string;
}

function connectionCount(graph: KnowledgeGraph, nodeId: string): number {
  return graph.edges.filter((e) => e.sourceId === nodeId || e.targetId === nodeId).length;
}

function neighborsOfType(
  graph: KnowledgeGraph,
  nodeId: string,
  type: KnowledgeGraphNodeType
): KnowledgeGraphNode[] {
  const neighborIds = new Set<string>();
  for (const edge of graph.edges) {
    if (edge.sourceId === nodeId) neighborIds.add(edge.targetId);
    if (edge.targetId === nodeId) neighborIds.add(edge.sourceId);
  }
  return graph.nodes.filter((n) => neighborIds.has(n.id) && n.type === type);
}

function nodesForMission(graph: KnowledgeGraph, missionId: string, type: KnowledgeGraphNodeType) {
  return graph.nodes.filter((n) => n.type === type && n.missionId === missionId);
}

export function analyzeKnowledgeGraphRelationships(graph: KnowledgeGraph): KnowledgeGraphSummary {
  const missionCounts = graph.nodes
    .filter((n) => n.type === "mission")
    .map((m) => ({
      id: m.id,
      title: m.title,
      connectionCount: connectionCount(graph, m.id),
    }))
    .sort((a, b) => b.connectionCount - a.connectionCount)
    .slice(0, 5);

  const interpretationRefs = new Map<string, number>();
  for (const edge of graph.edges) {
    const target = graph.nodes.find((n) => n.id === edge.targetId);
    if (target?.type === "interpretation") {
      interpretationRefs.set(target.id, (interpretationRefs.get(target.id) ?? 0) + 1);
    }
  }
  const mostReferencedInterpretations = [...interpretationRefs.entries()]
    .map(([id, referenceCount]) => {
      const node = graph.nodes.find((n) => n.id === id)!;
      return { id, title: node.title, referenceCount };
    })
    .sort((a, b) => b.referenceCount - a.referenceCount)
    .slice(0, 5);

  const narrativeThemes = graph.nodes
    .filter((n) => n.type === "narrative")
    .map((n) => n.description.slice(0, 80));
  const journalThemes = graph.nodes
    .filter((n) => n.type === "journal")
    .map((n) => n.title);
  const recurringGovernanceThemes = [...new Set([...narrativeThemes, ...journalThemes])].slice(0, 6);

  const activeAttentionClusters = graph.nodes
    .filter((n) => n.type === "attention")
    .slice(0, 6)
    .map((n) => ({ id: n.id, title: n.title, missionId: n.missionId }));

  const executiveReviewHotspots = graph.nodes
    .filter((n) => n.type === "executive_role")
    .map((role) => ({
      roleTitle: role.title,
      connectionCount: connectionCount(graph, role.id),
    }))
    .sort((a, b) => b.connectionCount - a.connectionCount);

  const connectedThemes =
    recurringGovernanceThemes.length > 0
      ? recurringGovernanceThemes
      : ["Governance themes will appear as interpretations and journals connect."];

  const activeReviewAreas = graph.nodes
    .filter((n) => n.type === "interpretation" || n.type === "attention")
    .slice(0, 5)
    .map((n) => n.title);

  const continuityClusters = graph.edges
    .filter((e) => e.relationshipType === "continues")
    .slice(0, 4)
    .map((e) => {
      const source = graph.nodes.find((n) => n.id === e.sourceId);
      const target = graph.nodes.find((n) => n.id === e.targetId);
      return `${source?.title ?? e.sourceId} → ${target?.title ?? e.targetId}`;
    });

  const executiveParticipation = executiveReviewHotspots
    .filter((h) => h.connectionCount > 0)
    .map((h) => `${h.roleTitle}: ${h.connectionCount} connected governance context(s)`);

  return {
    mostConnectedMissions: missionCounts,
    mostReferencedInterpretations,
    recurringGovernanceThemes,
    activeAttentionClusters,
    executiveReviewHotspots,
    connectedThemes,
    activeReviewAreas,
    continuityClusters:
      continuityClusters.length > 0
        ? continuityClusters
        : ["Continuity clusters form as interpretation sessions link over time."],
    executiveParticipation:
      executiveParticipation.length > 0
        ? executiveParticipation
        : ["Executive participation links appear as missions and attention connect to roles."],
    advisoryNote:
      "This relationship view highlights connected governance themes. The graph supports interpretation continuity—recommendation only, no prioritization.",
  };
}

export function inspectNodeRelationships(
  graph: KnowledgeGraph,
  nodeId: string
): NodeRelationshipInspection | null {
  const node = graph.nodes.find((n) => n.id === nodeId);
  if (!node) return null;

  const connectedEdges = graph.edges.filter(
    (e) => e.sourceId === nodeId || e.targetId === nodeId
  );

  return {
    node,
    relatedMissions: neighborsOfType(graph, nodeId, "mission").concat(
      node.type === "mission" ? [node] : []
    ),
    relatedJournals: neighborsOfType(graph, nodeId, "journal"),
    relatedNarratives: neighborsOfType(graph, nodeId, "narrative"),
    relatedAttention: neighborsOfType(graph, nodeId, "attention"),
    relatedReplay: neighborsOfType(graph, nodeId, "replay"),
    relatedInterpretations: neighborsOfType(graph, nodeId, "interpretation"),
    relatedTasks: neighborsOfType(graph, nodeId, "task"),
    relatedExecutiveRoles: neighborsOfType(graph, nodeId, "executive_role"),
    connectedEdges,
  };
}

export function buildMissionRelationshipView(
  graph: KnowledgeGraph,
  missionId: string
): MissionRelationshipView | null {
  const mission = graph.nodes.find((n) => n.id === missionId && n.type === "mission");
  if (!mission) return null;

  const narratives = nodesForMission(graph, missionId, "narrative");
  const journals = nodesForMission(graph, missionId, "journal");
  const attention = nodesForMission(graph, missionId, "attention");
  const interpretations = nodesForMission(graph, missionId, "interpretation");
  const replay = nodesForMission(graph, missionId, "replay");

  const neighborIds = new Set<string>();
  for (const edge of graph.edges) {
    if (edge.sourceId === missionId || edge.targetId === missionId) {
      neighborIds.add(edge.sourceId === missionId ? edge.targetId : edge.sourceId);
    }
  }
  const linkedNarratives = graph.nodes.filter(
    (n) => n.type === "narrative" && neighborIds.has(n.id) && !narratives.some((x) => x.id === n.id)
  );

  const roleIds = new Set<string>();
  for (const edge of graph.edges) {
    if (edge.targetId === missionId && edge.relationshipType === "supports") {
      roleIds.add(edge.sourceId);
    }
  }
  const executiveRoles = graph.nodes.filter(
    (n) => n.type === "executive_role" && roleIds.has(n.id)
  );

  return {
    missionId,
    missionTitle: mission.title,
    narratives: [...narratives, ...linkedNarratives],
    journals,
    attention,
    interpretations,
    replay,
    executiveRoles,
    summaryNote:
      "This relationship view highlights connected governance themes for this mission. Human interpretation remains central.",
  };
}
