import { getDecisionTheme } from "@/lib/orchestration/governance-history/decisionThemeCatalog";
import type { DecisionPathway } from "@/lib/orchestration/governance-history/decisionPathways";
import type {
  DecisionTraceability,
  DecisionTraceNode,
} from "@/lib/orchestration/governance-history/decisionTraceability";

export interface TraceabilitySummary {
  topPathways: Array<{ id: string; title: string }>;
  recurringReviewPaths: string[];
  executiveParticipationPaths: string[];
  continuityChains: string[];
  mostReferencedThemes: Array<{ title: string; count: number }>;
  recurringInterpretationPathways: string[];
  attentionInfluencePaths: string[];
  advisoryNote: string;
}

export interface PathExplorerStep {
  layer: string;
  node: DecisionTraceNode;
}

export interface PathExplorerView {
  selectedNodeId: string;
  steps: PathExplorerStep[];
  pathway: DecisionPathway | null;
}

export interface TraceabilityInspection {
  node: DecisionTraceNode;
  incoming: Array<{ relationshipType: string; fromTitle: string; fromId: string }>;
  outgoing: Array<{ relationshipType: string; toTitle: string; toId: string }>;
  connectedPathways: DecisionPathway[];
  continuityNotes: string[];
  reviewHistory: string;
}

export interface PathTimelineView {
  past: Array<{ at: string; label: string }>;
  interpretation: Array<{ at: string; label: string }>;
  currentContext: Array<{ at: string; label: string }>;
  continuityTheme: string;
}

const layerOrder: DecisionTraceNode["type"][] = [
  "decision_theme",
  "narrative",
  "interpretation",
  "journal",
  "attention",
  "mission",
  "journey",
  "executive_role",
];

function nodeById(traceability: DecisionTraceability, id: string) {
  return traceability.nodes.find((n) => n.id === id);
}

export function analyzeTraceability(traceability: DecisionTraceability): TraceabilitySummary {
  const themeCounts = new Map<string, number>();
  for (const node of traceability.nodes) {
    for (const themeId of node.themeIds ?? []) {
      const title = getDecisionTheme(themeId).title;
      themeCounts.set(title, (themeCounts.get(title) ?? 0) + 1);
    }
  }

  const continuityChains = traceability.pathways
    .filter((p) => p.nodeIds.length >= 3)
    .slice(0, 5)
    .map((p) => p.title);

  const executivePaths = traceability.pathways
    .filter((p) =>
      p.nodeIds.some((id) => traceability.nodes.find((n) => n.id === id)?.type === "executive_role")
    )
    .slice(0, 4)
    .map((p) => p.title);

  const attentionPaths = traceability.pathways
    .filter((p) => p.title.includes("Attention"))
    .slice(0, 4)
    .map((p) => p.title);

  return {
    topPathways: traceability.pathways.slice(0, 6).map((p) => ({ id: p.id, title: p.title })),
    recurringReviewPaths: traceability.pathways
      .filter((p) => p.title.includes("Interpretation") || p.title.includes("journey"))
      .slice(0, 5)
      .map((p) => p.title),
    executiveParticipationPaths:
      executivePaths.length > 0
        ? executivePaths
        : ["Executive participation paths form as roles connect to governance memory."],
    continuityChains:
      continuityChains.length > 0
        ? continuityChains
        : ["Continuity chains will appear as interpretation sessions link over time."],
    mostReferencedThemes: [...themeCounts.entries()]
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6),
    recurringInterpretationPathways: traceability.pathways
      .filter((p) => p.title.includes("Interpretation"))
      .slice(0, 5)
      .map((p) => p.title),
    attentionInfluencePaths:
      attentionPaths.length > 0
        ? attentionPaths
        : ["Attention influence paths appear when attention links to missions."],
    advisoryNote:
      "This traceability view supports continuity of executive understanding. Pathways explain connected history—not autonomous conclusions.",
  };
}

export function buildPathExplorerView(
  traceability: DecisionTraceability,
  nodeId: string
): PathExplorerView | null {
  const node = nodeById(traceability, nodeId);
  if (!node) return null;

  const pathway =
    traceability.pathways.find((p) => p.nodeIds.includes(nodeId)) ??
    traceability.pathways[0] ??
    null;

  const pathNodeIds = pathway?.nodeIds ?? [nodeId];
  const pathNodes = pathNodeIds
    .map((id) => nodeById(traceability, id))
    .filter((n): n is DecisionTraceNode => Boolean(n));

  const sorted = [...pathNodes].sort(
    (a, b) => layerOrder.indexOf(a.type) - layerOrder.indexOf(b.type)
  );

  const steps: PathExplorerStep[] = sorted.map((n) => ({
    layer: n.type.replaceAll("_", " "),
    node: n,
  }));

  if (steps.length === 0) {
    steps.push({ layer: node.type.replaceAll("_", " "), node });
  }

  return { selectedNodeId: nodeId, steps, pathway };
}

export function inspectTraceabilityNode(
  traceability: DecisionTraceability,
  nodeId: string
): TraceabilityInspection | null {
  const node = nodeById(traceability, nodeId);
  if (!node) return null;

  const incoming = traceability.edges
    .filter((e) => e.targetId === nodeId)
    .map((e) => ({
      relationshipType: e.relationshipType.replaceAll("_", " "),
      fromTitle: nodeById(traceability, e.sourceId)?.title ?? e.sourceId,
      fromId: e.sourceId,
    }));

  const outgoing = traceability.edges
    .filter((e) => e.sourceId === nodeId)
    .map((e) => ({
      relationshipType: e.relationshipType.replaceAll("_", " "),
      toTitle: nodeById(traceability, e.targetId)?.title ?? e.targetId,
      toId: e.targetId,
    }));

  const connectedPathways = traceability.pathways.filter((p) => p.nodeIds.includes(nodeId));

  return {
    node,
    incoming,
    outgoing,
    connectedPathways,
    continuityNotes: connectedPathways.map((p) => p.continuityNote),
    reviewHistory: `${node.title} recorded ${node.createdAt.slice(0, 16)} for executive explainability.`,
  };
}

export function buildPathTimeline(
  traceability: DecisionTraceability,
  pathwayId?: string
): PathTimelineView {
  const pathway =
    (pathwayId ? traceability.pathways.find((p) => p.id === pathwayId) : null) ??
    traceability.pathways[0];

  if (!pathway) {
    return {
      past: [],
      interpretation: [],
      currentContext: [],
      continuityTheme: "Record interpretations to form traceability timelines.",
    };
  }

  const pathNodes = pathway.nodeIds
    .map((id) => nodeById(traceability, id))
    .filter((n): n is DecisionTraceNode => Boolean(n))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const past = pathNodes
    .filter((n) => n.type === "decision_theme" || n.type === "narrative")
    .map((n) => ({ at: n.createdAt, label: n.title }));
  const interpretation = pathNodes
    .filter((n) => n.type === "interpretation" || n.type === "journal")
    .map((n) => ({ at: n.createdAt, label: n.title }));
  const currentContext = pathNodes
    .filter((n) => n.type === "attention" || n.type === "mission")
    .map((n) => ({ at: n.createdAt, label: n.title }));

  const themeNode = pathNodes.find((n) => n.type === "decision_theme");
  const continuityTheme =
    themeNode?.description ??
    pathway.continuityNote ??
    "Continuity theme emerges as pathways connect governance memory.";

  return { past, interpretation, currentContext, continuityTheme };
}

export function buildMissionDecisionPathView(
  traceability: DecisionTraceability,
  missionId: string
): {
  missionTitle: string;
  relatedPathways: DecisionPathway[];
  relatedThemes: string[];
  relatedNarratives: DecisionTraceNode[];
  relatedAttention: DecisionTraceNode[];
  summaryNote: string;
} | null {
  const mission = traceability.nodes.find((n) => n.id === missionId && n.type === "mission");
  if (!mission) return null;

  const relatedPathways = traceability.pathways.filter((p) => p.nodeIds.includes(missionId));
  const connected = traceability.nodes.filter((n) =>
    traceability.edges.some(
      (e) =>
        (e.sourceId === missionId && e.targetId === n.id) ||
        (e.targetId === missionId && e.sourceId === n.id)
    )
  );

  const themeSet = new Set<string>();
  for (const node of [mission, ...connected]) {
    for (const themeId of node.themeIds ?? []) {
      themeSet.add(getDecisionTheme(themeId).title);
    }
  }

  return {
    missionTitle: mission.title,
    relatedPathways,
    relatedThemes: [...themeSet],
    relatedNarratives: connected.filter((n) => n.type === "narrative"),
    relatedAttention: connected.filter((n) => n.type === "attention"),
    summaryNote:
      "Mission decision paths support explainability—what connected to this mission, not what the AI concluded.",
  };
}
