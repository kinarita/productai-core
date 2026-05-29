import type { DecisionTheme, DecisionThemeId } from "@/lib/orchestration/governance-history/decisionThemeCatalog";

export type DecisionMemoryNodeType =
  | "mission"
  | "attention"
  | "journal"
  | "interpretation"
  | "narrative"
  | "journey"
  | "executive_role"
  | "decision_theme";

export interface DecisionMemoryNode {
  id: string;
  type: DecisionMemoryNodeType;
  title: string;
  description: string;
  createdAt: string;
  missionId?: string;
  themeIds?: DecisionThemeId[];
}

export interface DecisionMemoryEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationshipType: "related_to" | "references" | "continues" | "themes" | "supports";
}

export interface DecisionMemoryAtlas {
  nodes: DecisionMemoryNode[];
  edges: DecisionMemoryEdge[];
  themes: DecisionTheme[];
  generatedAt: string;
}

export type AtlasViewId = "summary" | "themes" | "timeline" | "inspector";

export function atlasNodeTypeLabel(type: DecisionMemoryNodeType): string {
  return type.replaceAll("_", " ");
}
