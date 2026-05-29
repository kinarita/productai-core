import type { Mission, Task } from "@/types/productai";
import type { DecisionAttentionItem } from "@/lib/orchestration/decision-attention/decisionAttention";
import type { ReplayInterpretationRecord } from "@/lib/orchestration/governance-history/replayInterpretationHistory";
import type { GovernanceJournalEntry } from "@/lib/orchestration/governance-history/governanceJournal";
import type { ExecutiveGovernanceNarrative } from "@/lib/orchestration/governance-history/governanceNarratives";
import {
  executiveRoleCatalog,
  type KnowledgeGraph,
  type KnowledgeGraphEdge,
  type KnowledgeGraphNode,
} from "@/lib/orchestration/governance-history/governanceKnowledgeGraph";

function edgeId(sourceId: string, targetId: string, relationshipType: string): string {
  return `edge-${sourceId}-${targetId}-${relationshipType}`;
}

function addEdge(
  edges: KnowledgeGraphEdge[],
  seen: Set<string>,
  sourceId: string,
  targetId: string,
  relationshipType: KnowledgeGraphEdge["relationshipType"]
) {
  const id = edgeId(sourceId, targetId, relationshipType);
  if (seen.has(id) || sourceId === targetId) return;
  seen.add(id);
  edges.push({ id, sourceId, targetId, relationshipType });
}

export function buildGovernanceKnowledgeGraph(input: {
  missions: Mission[];
  tasks: Task[];
  interpretations: ReplayInterpretationRecord[];
  journals: GovernanceJournalEntry[];
  narratives: ExecutiveGovernanceNarrative[];
  decisionAttention: DecisionAttentionItem[];
}): KnowledgeGraph {
  const nodes: KnowledgeGraphNode[] = [];
  const edges: KnowledgeGraphEdge[] = [];
  const seenEdges = new Set<string>();
  const nodeIndex = new Set<string>();

  const pushNode = (node: KnowledgeGraphNode) => {
    if (nodeIndex.has(node.id)) return;
    nodeIndex.add(node.id);
    nodes.push(node);
  };

  for (const mission of input.missions) {
    pushNode({
      id: mission.id,
      type: "mission",
      title: mission.name,
      description: mission.summary || mission.description,
      createdAt: mission.createdAt ?? mission.updatedAt,
      missionId: mission.id,
    });
  }

  for (const task of input.tasks) {
    pushNode({
      id: task.id,
      type: "task",
      title: task.title,
      description: `${task.status.replaceAll("_", " ")} · ${task.missionName}`,
      createdAt: task.updatedAt ?? new Date().toISOString(),
      missionId: task.missionId,
      taskId: task.id,
    });
    addEdge(edges, seenEdges, task.missionId, task.id, "related_to");
  }

  for (const role of executiveRoleCatalog) {
    pushNode({
      id: role.id,
      type: "executive_role",
      title: role.title,
      description: role.description,
      createdAt: new Date(0).toISOString(),
    });
  }

  for (const mission of input.missions) {
    for (const agent of mission.assignedAgents) {
      const role = executiveRoleCatalog.find(
        (r) =>
          r.title.toLowerCase() === agent.toLowerCase() ||
          (agent === "Architect" && r.id === "role-chief-architect")
      );
      if (role) {
        addEdge(edges, seenEdges, role.id, mission.id, "supports");
      }
    }
    addEdge(edges, seenEdges, "role-ceo", mission.id, "influences");
  }

  for (const item of input.decisionAttention) {
    pushNode({
      id: item.id,
      type: "attention",
      title: item.governanceReason.slice(0, 80),
      description: item.whyThisNeedsAttention,
      createdAt: new Date().toISOString(),
      missionId: item.missionId,
      taskId: item.taskId,
    });
    addEdge(edges, seenEdges, item.id, item.missionId, "related_to");
    if (item.taskId) {
      addEdge(edges, seenEdges, item.id, item.taskId, "reviews");
    }
    addEdge(edges, seenEdges, "role-ceo", item.id, "influences");
  }

  const sortedInterpretations = [...input.interpretations].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );

  for (const record of sortedInterpretations) {
    pushNode({
      id: record.id,
      type: "interpretation",
      title: `${record.scope.replaceAll("_", " ")} interpretation`,
      description: record.summary,
      createdAt: record.createdAt,
      missionId: record.replayQuery.mission !== "all" ? record.replayQuery.mission : undefined,
    });

    const replayNodeId = `replay-${record.scope}-${record.window}-${record.id}`;
    pushNode({
      id: replayNodeId,
      type: "replay",
      title: `${record.scope.replaceAll("_", " ")} replay · ${record.window}`,
      description: record.reviewFocus,
      createdAt: record.createdAt,
      missionId: record.replayQuery.mission !== "all" ? record.replayQuery.mission : undefined,
    });
    addEdge(edges, seenEdges, record.id, replayNodeId, "interprets");

    if (record.replayQuery.mission !== "all") {
      addEdge(edges, seenEdges, record.id, record.replayQuery.mission, "related_to");
      addEdge(edges, seenEdges, replayNodeId, record.replayQuery.mission, "references");
    }
    addEdge(edges, seenEdges, "role-cgo", record.id, "supports");
  }

  for (let i = 1; i < sortedInterpretations.length; i += 1) {
    addEdge(
      edges,
      seenEdges,
      sortedInterpretations[i - 1].id,
      sortedInterpretations[i].id,
      "continues"
    );
  }

  for (const journal of input.journals) {
    pushNode({
      id: journal.id,
      type: "journal",
      title: journal.title,
      description: journal.humanInterpretation.slice(0, 160),
      createdAt: journal.createdAt,
      missionId: journal.relatedMissionId,
    });
    if (journal.relatedMissionId) {
      addEdge(edges, seenEdges, journal.id, journal.relatedMissionId, "related_to");
    }
    if (journal.relatedAttentionId) {
      addEdge(edges, seenEdges, journal.id, journal.relatedAttentionId, "reviews");
    }
    addEdge(edges, seenEdges, "role-ceo", journal.id, "influences");
  }

  for (const narrative of input.narratives) {
    pushNode({
      id: narrative.id,
      type: "narrative",
      title: narrative.title,
      description: narrative.summary.slice(0, 200),
      createdAt: narrative.createdAt,
    });
    for (const interpretationId of narrative.relatedInterpretations) {
      addEdge(edges, seenEdges, narrative.id, interpretationId, "references");
      const interpretation = input.interpretations.find((r) => r.id === interpretationId);
      if (interpretation?.replayQuery.mission && interpretation.replayQuery.mission !== "all") {
        addEdge(edges, seenEdges, narrative.id, interpretation.replayQuery.mission, "related_to");
      }
    }
    for (const journalId of narrative.relatedJournals) {
      addEdge(edges, seenEdges, narrative.id, journalId, "references");
      const journal = input.journals.find((j) => j.id === journalId);
      if (journal?.relatedMissionId) {
        addEdge(edges, seenEdges, narrative.id, journal.relatedMissionId, "related_to");
      }
    }
    addEdge(edges, seenEdges, "role-cgo", narrative.id, "supports");
  }

  return {
    nodes,
    edges,
    generatedAt: new Date().toISOString(),
  };
}
