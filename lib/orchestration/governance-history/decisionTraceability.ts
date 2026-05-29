import type { DecisionThemeId } from "@/lib/orchestration/governance-history/decisionThemeCatalog";
import type { DecisionPathway } from "@/lib/orchestration/governance-history/decisionPathways";

export type DecisionTraceNodeType =
  | "mission"
  | "attention"
  | "interpretation"
  | "journal"
  | "narrative"
  | "journey"
  | "decision_theme"
  | "executive_role";

export type DecisionTraceRelationshipType =
  | "influenced_by"
  | "reviewed_with"
  | "derived_from"
  | "continued_by"
  | "referenced_by"
  | "connected_to";

export interface DecisionTraceNode {
  id: string;
  type: DecisionTraceNodeType;
  title: string;
  description: string;
  createdAt: string;
  missionId?: string;
  themeIds?: DecisionThemeId[];
}

export interface DecisionTraceEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationshipType: DecisionTraceRelationshipType;
}

export interface DecisionTraceability {
  nodes: DecisionTraceNode[];
  edges: DecisionTraceEdge[];
  pathways: DecisionPathway[];
  generatedAt: string;
}

export type TraceabilityViewId = "summary" | "paths" | "timeline" | "inspector";

export function traceNodeTypeLabel(type: DecisionTraceNodeType): string {
  return type.replaceAll("_", " ");
}

export function traceRelationshipLabel(type: DecisionTraceRelationshipType): string {
  return type.replaceAll("_", " ");
}
