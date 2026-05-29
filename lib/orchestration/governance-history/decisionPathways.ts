export interface DecisionPathway {
  id: string;
  title: string;
  startNodeId: string;
  endNodeId: string;
  nodeIds: string[];
  createdAt: string;
  continuityNote: string;
}

export function createDecisionPathway(input: {
  title: string;
  nodeIds: string[];
  continuityNote?: string;
}): DecisionPathway | null {
  if (input.nodeIds.length < 2) return null;
  const startNodeId = input.nodeIds[0];
  const endNodeId = input.nodeIds[input.nodeIds.length - 1];
  return {
    id: `pathway-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: input.title,
    startNodeId,
    endNodeId,
    nodeIds: input.nodeIds,
    createdAt: new Date().toISOString(),
    continuityNote:
      input.continuityNote ??
      "This pathway illustrates how governance interpretations became connected over time.",
  };
}

export function pathwayNodeLabels(pathway: DecisionPathway, nodeTitleById: Map<string, string>): string {
  return pathway.nodeIds.map((id) => nodeTitleById.get(id) ?? id).join(" → ");
}
