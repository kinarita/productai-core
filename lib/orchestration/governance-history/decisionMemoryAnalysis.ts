import type { DecisionThemeId } from "@/lib/orchestration/governance-history/decisionThemeCatalog";
import { getDecisionTheme } from "@/lib/orchestration/governance-history/decisionThemeCatalog";
import type {
  DecisionMemoryAtlas,
  DecisionMemoryNode,
} from "@/lib/orchestration/governance-history/decisionMemoryAtlas";

export interface DecisionAtlasSummary {
  topThemes: Array<{ id: DecisionThemeId; title: string; count: number }>;
  reviewContinuity: string[];
  decisionContext: string[];
  executiveParticipation: string[];
  recurringDecisionThemes: string[];
  mostRevisitedMissions: Array<{ id: string; title: string; visits: number }>;
  frequentlyReviewedNarratives: Array<{ id: string; title: string }>;
  recurringAttentionPatterns: string[];
  executiveParticipationThemes: string[];
  advisoryNote: string;
}

export interface ThemeExplorerView {
  themeId: DecisionThemeId;
  themeTitle: string;
  themeDescription: string;
  relatedMissions: DecisionMemoryNode[];
  relatedNarratives: DecisionMemoryNode[];
  relatedJournals: DecisionMemoryNode[];
  relatedAttention: DecisionMemoryNode[];
  relatedInterpretations: DecisionMemoryNode[];
  relatedJourneys: DecisionMemoryNode[];
}

export interface DecisionMemoryInspection {
  node: DecisionMemoryNode;
  history: string;
  relatedThemes: Array<{ id: DecisionThemeId; title: string }>;
  relatedMissions: DecisionMemoryNode[];
  relatedJourneys: DecisionMemoryNode[];
  continuityNotes: string[];
}

export interface ThemeTimelineEntry {
  at: string;
  label: string;
  phase: "past" | "present" | "continuing";
  themeIds: DecisionThemeId[];
}

export interface DecisionThemeTimeline {
  themeId: DecisionThemeId;
  themeTitle: string;
  past: ThemeTimelineEntry[];
  present: ThemeTimelineEntry[];
  continuing: ThemeTimelineEntry[];
  continuityLabel: string;
}

function neighbors(
  atlas: DecisionMemoryAtlas,
  nodeId: string,
  type?: DecisionMemoryNode["type"]
): DecisionMemoryNode[] {
  const ids = new Set<string>();
  for (const edge of atlas.edges) {
    if (edge.sourceId === nodeId) ids.add(edge.targetId);
    if (edge.targetId === nodeId) ids.add(edge.sourceId);
  }
  return atlas.nodes.filter((n) => ids.has(n.id) && (!type || n.type === type));
}

function nodesForTheme(atlas: DecisionMemoryAtlas, themeId: DecisionThemeId, type: DecisionMemoryNode["type"]) {
  const themeNodeId = `theme-${themeId}`;
  return neighbors(atlas, themeNodeId).filter((n) => n.type === type);
}

export function analyzeDecisionMemoryAtlas(atlas: DecisionMemoryAtlas): DecisionAtlasSummary {
  const themeCounts = new Map<DecisionThemeId, number>();
  for (const node of atlas.nodes) {
    for (const themeId of node.themeIds ?? []) {
      themeCounts.set(themeId, (themeCounts.get(themeId) ?? 0) + 1);
    }
  }

  const topThemes = [...themeCounts.entries()]
    .map(([id, count]) => ({
      id,
      title: getDecisionTheme(id).title,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const missionVisits = new Map<string, { title: string; visits: number }>();
  for (const node of atlas.nodes.filter((n) => n.type === "mission")) {
    const count = atlas.edges.filter((e) => e.sourceId === node.id || e.targetId === node.id).length;
    missionVisits.set(node.id, { title: node.title, visits: count });
  }

  const continuingEdges = atlas.edges.filter((e) => e.relationshipType === "continues");
  const reviewContinuity =
    continuingEdges.length > 0
      ? continuingEdges.slice(0, 4).map((e) => {
          const source = atlas.nodes.find((n) => n.id === e.sourceId);
          const target = atlas.nodes.find((n) => n.id === e.targetId);
          return `${source?.title ?? e.sourceId} → ${target?.title ?? e.targetId}`;
        })
      : ["Review continuity will form as interpretation sessions link over time."];

  const decisionContext = atlas.nodes
    .filter((n) => n.type === "narrative" || n.type === "interpretation")
    .slice(0, 5)
    .map((n) => n.title);

  const executiveParticipation = atlas.nodes
    .filter((n) => n.type === "executive_role")
    .map((role) => {
      const count = atlas.edges.filter((e) => e.sourceId === role.id || e.targetId === role.id).length;
      return `${role.title}: ${count} connected memory context(s)`;
    });

  return {
    topThemes,
    reviewContinuity,
    decisionContext,
    executiveParticipation,
    recurringDecisionThemes: topThemes.map((t) => t.title),
    mostRevisitedMissions: [...missionVisits.entries()]
      .map(([id, data]) => ({ id, title: data.title, visits: data.visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5),
    frequentlyReviewedNarratives: atlas.nodes
      .filter((n) => n.type === "narrative")
      .slice(0, 5)
      .map((n) => ({ id: n.id, title: n.title })),
    recurringAttentionPatterns: atlas.nodes
      .filter((n) => n.type === "attention")
      .slice(0, 5)
      .map((n) => n.title),
    executiveParticipationThemes: executiveParticipation,
    advisoryNote:
      "This atlas highlights recurring decision themes observed across governance reviews. The atlas supports continuity of executive interpretation—recommendation only.",
  };
}

export function buildThemeExplorerView(
  atlas: DecisionMemoryAtlas,
  themeId: DecisionThemeId
): ThemeExplorerView {
  const theme = getDecisionTheme(themeId);
  return {
    themeId,
    themeTitle: theme.title,
    themeDescription: theme.description,
    relatedMissions: nodesForTheme(atlas, themeId, "mission"),
    relatedNarratives: nodesForTheme(atlas, themeId, "narrative"),
    relatedJournals: nodesForTheme(atlas, themeId, "journal"),
    relatedAttention: nodesForTheme(atlas, themeId, "attention"),
    relatedInterpretations: nodesForTheme(atlas, themeId, "interpretation"),
    relatedJourneys: nodesForTheme(atlas, themeId, "journey"),
  };
}

export function inspectDecisionMemoryNode(
  atlas: DecisionMemoryAtlas,
  nodeId: string
): DecisionMemoryInspection | null {
  const node = atlas.nodes.find((n) => n.id === nodeId);
  if (!node) return null;

  const relatedThemes = (node.themeIds ?? []).map((id) => ({
    id,
    title: getDecisionTheme(id).title,
  }));

  return {
    node,
    history: `${node.title} · ${node.createdAt.slice(0, 16)} — ${node.description.slice(0, 200)}`,
    relatedThemes,
    relatedMissions: neighbors(atlas, nodeId, "mission").concat(node.type === "mission" ? [node] : []),
    relatedJourneys: neighbors(atlas, nodeId, "journey"),
    continuityNotes: [
      node.description.slice(0, 160),
      relatedThemes.length > 0
        ? `Themes: ${relatedThemes.map((t) => t.title).join(", ")}`
        : "Themes will link as governance memory grows.",
    ],
  };
}

export function buildDecisionThemeTimeline(
  atlas: DecisionMemoryAtlas,
  themeId: DecisionThemeId
): DecisionThemeTimeline {
  const theme = getDecisionTheme(themeId);
  const related = atlas.nodes
    .filter((n) => n.themeIds?.includes(themeId) && n.type !== "decision_theme")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const now = new Date().toISOString();
  const entries: ThemeTimelineEntry[] = related.map((node, index) => {
    const isLast = index === related.length - 1;
    const phase: ThemeTimelineEntry["phase"] =
      index === 0 ? "past" : isLast ? "present" : "continuing";
    return {
      at: node.createdAt,
      label: node.title,
      phase,
      themeIds: node.themeIds ?? [themeId],
    };
  });

  const past = entries.filter((e) => e.phase === "past");
  const present = entries.filter((e) => e.phase === "present");
  const continuing = entries.filter((e) => e.phase === "continuing");

  return {
    themeId,
    themeTitle: theme.title,
    past,
    present,
    continuing,
    continuityLabel:
      entries.length >= 2
        ? `Continuity from ${entries[0].at.slice(0, 10)} toward ${entries[entries.length - 1].at.slice(0, 10)}`
        : "Timeline will expand as governance memory accrues for this theme.",
  };
}

export function buildMissionDecisionContext(
  atlas: DecisionMemoryAtlas,
  missionId: string
): {
  missionTitle: string;
  relatedThemes: Array<{ id: DecisionThemeId; title: string }>;
  relatedNarratives: DecisionMemoryNode[];
  relatedAttention: DecisionMemoryNode[];
  relatedJourneys: DecisionMemoryNode[];
  summaryNote: string;
} | null {
  const mission = atlas.nodes.find((n) => n.id === missionId && n.type === "mission");
  if (!mission) return null;

  const themeIds = new Set<DecisionThemeId>();
  const connected = atlas.nodes.filter(
    (n) =>
      n.missionId === missionId ||
      atlas.edges.some(
        (e) =>
          (e.sourceId === missionId && e.targetId === n.id) ||
          (e.targetId === missionId && e.sourceId === n.id)
      )
  );
  for (const node of connected) {
    for (const themeId of node.themeIds ?? []) themeIds.add(themeId);
  }

  return {
    missionTitle: mission.title,
    relatedThemes: [...themeIds].map((id) => ({ id, title: getDecisionTheme(id).title })),
    relatedNarratives: connected.filter((n) => n.type === "narrative"),
    relatedAttention: connected.filter((n) => n.type === "attention"),
    relatedJourneys: connected.filter((n) => n.type === "journey"),
    summaryNote:
      "Decision context supports what to re-read—not what the AI decided. Human judgment remains central.",
  };
}
