export type KnowledgeGraphNodeType =
  | "mission"
  | "task"
  | "attention"
  | "interpretation"
  | "journal"
  | "narrative"
  | "replay"
  | "executive_role";

export type KnowledgeGraphRelationshipType =
  | "related_to"
  | "references"
  | "interprets"
  | "reviews"
  | "continues"
  | "influences"
  | "supports";

export interface KnowledgeGraphNode {
  id: string;
  type: KnowledgeGraphNodeType;
  title: string;
  description: string;
  createdAt: string;
  missionId?: string;
  taskId?: string;
}

export interface KnowledgeGraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationshipType: KnowledgeGraphRelationshipType;
}

export interface KnowledgeGraph {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  generatedAt: string;
}

export const executiveRoleCatalog: Array<{
  id: string;
  title: string;
  description: string;
}> = [
  {
    id: "role-ceo",
    title: "CEO",
    description: "Executive decision center for AI-driven organization direction.",
  },
  {
    id: "role-coo",
    title: "COO",
    description: "Operational coordination and governance continuity reading.",
  },
  {
    id: "role-cto",
    title: "CTO",
    description: "Technical architecture and engineering governance context.",
  },
  {
    id: "role-cpo",
    title: "CPO",
    description: "Product direction and stakeholder alignment context.",
  },
  {
    id: "role-chief-architect",
    title: "Chief Architect",
    description: "Architecture continuity and specification governance.",
  },
  {
    id: "role-cgo",
    title: "Chief Governance Officer",
    description: "Governance interpretation and continuity oversight.",
  },
];

export function nodeTypeLabel(type: KnowledgeGraphNodeType): string {
  return type.replaceAll("_", " ");
}

export function relationshipTypeLabel(type: KnowledgeGraphRelationshipType): string {
  return type.replaceAll("_", " ");
}
