import type { DecisionAttentionItem } from "@/lib/orchestration/decision-attention/decisionAttention";
import type { ExecutiveGovernanceNarrative } from "@/lib/orchestration/governance-history/governanceNarratives";
import type { GovernanceJournalEntry } from "@/lib/orchestration/governance-history/governanceJournal";
import type { ReplayInterpretationRecord } from "@/lib/orchestration/governance-history/replayInterpretationHistory";
import type { ExecutiveReviewJourney } from "@/lib/orchestration/governance-history/reviewJourney";
import type { KnowledgeGraph } from "@/lib/orchestration/governance-history/governanceKnowledgeGraph";
import {
  decisionThemeCatalog,
  inferDecisionThemes,
  type DecisionThemeId,
} from "@/lib/orchestration/governance-history/decisionThemeCatalog";
import type {
  DecisionMemoryAtlas,
  DecisionMemoryEdge,
  DecisionMemoryNode,
  DecisionMemoryNodeType,
} from "@/lib/orchestration/governance-history/decisionMemoryAtlas";

const atlasTypes = new Set<DecisionMemoryNodeType>([
  "mission",
  "attention",
  "journal",
  "interpretation",
  "narrative",
  "executive_role",
]);

function edgeId(sourceId: string, targetId: string, relationshipType: string): string {
  return `atlas-edge-${sourceId}-${targetId}-${relationshipType}`;
}

function addEdge(
  edges: DecisionMemoryEdge[],
  seen: Set<string>,
  sourceId: string,
  targetId: string,
  relationshipType: DecisionMemoryEdge["relationshipType"]
) {
  const id = edgeId(sourceId, targetId, relationshipType);
  if (seen.has(id) || sourceId === targetId) return;
  seen.add(id);
  edges.push({ id, sourceId, targetId, relationshipType });
}

function themesForEntity(input: {
  text: string;
  explicit?: DecisionThemeId[];
}): DecisionThemeId[] {
  const inferred = inferDecisionThemes(input.text);
  return [...new Set([...(input.explicit ?? []), ...inferred])];
}

export function buildDecisionMemoryAtlas(input: {
  narratives: ExecutiveGovernanceNarrative[];
  journals: GovernanceJournalEntry[];
  interpretations: ReplayInterpretationRecord[];
  journeys: ExecutiveReviewJourney[];
  decisionAttention: DecisionAttentionItem[];
  governanceGraph: KnowledgeGraph;
}): DecisionMemoryAtlas {
  const nodes: DecisionMemoryNode[] = [];
  const edges: DecisionMemoryEdge[] = [];
  const seenEdges = new Set<string>();
  const nodeIndex = new Set<string>();
  const themeUsage = new Map<DecisionThemeId, number>();

  const pushNode = (node: DecisionMemoryNode) => {
    if (nodeIndex.has(node.id)) return;
    nodeIndex.add(node.id);
    nodes.push(node);
    for (const themeId of node.themeIds ?? []) {
      themeUsage.set(themeId, (themeUsage.get(themeId) ?? 0) + 1);
    }
  };

  for (const graphNode of input.governanceGraph.nodes) {
    if (!atlasTypes.has(graphNode.type as DecisionMemoryNodeType)) continue;
    const text = `${graphNode.title} ${graphNode.description}`;
    pushNode({
      id: graphNode.id,
      type: graphNode.type as DecisionMemoryNodeType,
      title: graphNode.title,
      description: graphNode.description,
      createdAt: graphNode.createdAt,
      missionId: graphNode.missionId,
      themeIds: themesForEntity({ text }),
    });
  }

  for (const journey of input.journeys) {
    const text = `${journey.title} ${journey.continuityFocus} ${journey.recentThemes.join(" ")}`;
    pushNode({
      id: journey.id,
      type: "journey",
      title: journey.title,
      description: journey.continuityFocus,
      createdAt: journey.startedAt,
      themeIds: themesForEntity({ text }),
    });
  }

  for (const narrative of input.narratives) {
    if (nodeIndex.has(narrative.id)) {
      const existing = nodes.find((n) => n.id === narrative.id);
      if (existing) {
        existing.themeIds = themesForEntity({
          text: `${narrative.title} ${narrative.summary}`,
          explicit: narrative.relatedDecisionThemes,
        });
      }
      continue;
    }
    pushNode({
      id: narrative.id,
      type: "narrative",
      title: narrative.title,
      description: narrative.summary,
      createdAt: narrative.createdAt,
      themeIds: themesForEntity({
        text: `${narrative.title} ${narrative.summary} ${narrative.continuityTheme}`,
        explicit: narrative.relatedDecisionThemes,
      }),
    });
  }

  for (const journal of input.journals) {
    if (!nodeIndex.has(journal.id)) {
      pushNode({
        id: journal.id,
        type: "journal",
        title: journal.title,
        description: journal.humanInterpretation,
        createdAt: journal.createdAt,
        missionId: journal.relatedMissionId,
        themeIds: themesForEntity({
          text: `${journal.title} ${journal.humanInterpretation} ${journal.continuityCategory}`,
          explicit: journal.relatedDecisionThemes,
        }),
      });
    }
  }

  for (const theme of decisionThemeCatalog) {
    if ((themeUsage.get(theme.id) ?? 0) === 0) continue;
    pushNode({
      id: `theme-${theme.id}`,
      type: "decision_theme",
      title: theme.title,
      description: theme.description,
      createdAt: new Date(0).toISOString(),
      themeIds: [theme.id],
    });
  }

  for (const entity of nodes.filter((n) => n.type !== "decision_theme")) {
    for (const themeId of entity.themeIds ?? []) {
      addEdge(edges, seenEdges, `theme-${themeId}`, entity.id, "themes");
    }
  }

  for (const graphEdge of input.governanceGraph.edges) {
    const sourceExists = nodeIndex.has(graphEdge.sourceId);
    const targetExists = nodeIndex.has(graphEdge.targetId);
    if (!sourceExists || !targetExists) continue;
    const rel =
      graphEdge.relationshipType === "continues"
        ? "continues"
        : graphEdge.relationshipType === "supports"
          ? "supports"
          : "related_to";
    addEdge(edges, seenEdges, graphEdge.sourceId, graphEdge.targetId, rel);
  }

  for (const journey of input.journeys) {
    for (const interpretationId of journey.recentInterpretations) {
      if (nodeIndex.has(interpretationId)) {
        addEdge(edges, seenEdges, journey.id, interpretationId, "references");
      }
    }
    for (const journalId of journey.recentJournals) {
      if (nodeIndex.has(journalId)) {
        addEdge(edges, seenEdges, journey.id, journalId, "references");
      }
    }
  }

  const activeThemes = decisionThemeCatalog.filter((t) => (themeUsage.get(t.id) ?? 0) > 0);

  return {
    nodes,
    edges,
    themes: activeThemes,
    generatedAt: new Date().toISOString(),
  };
}
