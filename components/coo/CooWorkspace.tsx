"use client";

import Link from "next/link";
import type { Mission, Task } from "@/types/productai";
import type { DecisionAttentionItem } from "@/lib/orchestration/decision-attention/decisionAttention";
import { Card } from "@/components/Card";
import { CooMissionPipeline } from "@/components/coo/CooMissionPipeline";
import { CooMissionBoard } from "@/components/coo/CooMissionBoard";
import { CooWorkflowOverview } from "@/components/coo/CooWorkflowOverview";
import { CooBottleneckPanel } from "@/components/coo/CooBottleneckPanel";
import { CooRecommendationsPanel } from "@/components/coo/CooRecommendationsPanel";
import { useCooWorkspace } from "@/lib/hooks/useCooWorkspace";
import { buildCooMissionContext } from "@/lib/coo/cooMissionAnalysis";
import { cooWorkspaceAdvisoryNote } from "@/lib/coo/cooWorkspace";
import { useCooWorkspaceStore } from "@/lib/store/cooWorkspaceStore";
import { cn } from "@/lib/utils";

export function CooContextPanel({
  mission,
  tasks,
  decisionAttention,
}: {
  mission: Mission;
  tasks: Task[];
  decisionAttention: DecisionAttentionItem[];
}) {
  const context = buildCooMissionContext({ mission, tasks, decisionAttention });

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">{context.advisoryNote}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Current Stage</p>
          <p className="text-sm font-medium">{context.currentStageLabel}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Related Attention</p>
          <p className="text-sm font-medium">{context.relatedAttention.length} item(s)</p>
        </div>
      </div>
      {context.dependencies.length > 0 ? (
        <div>
          <p className="text-xs font-medium uppercase text-muted">Dependencies</p>
          <ul className="mt-1 space-y-0.5 text-xs text-muted">
            {context.dependencies.map((d) => (
              <li key={d}>· {d}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {context.relatedAttention.length > 0 ? (
        <div>
          <p className="text-xs font-medium uppercase text-muted">Related Attention</p>
          <ul className="mt-1 space-y-1 text-xs text-muted">
            {context.relatedAttention.map((a) => (
              <li key={a.id}>· {a.whyThisNeedsAttention}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div>
        <p className="text-xs font-medium uppercase text-muted">Recommended Coordination Areas</p>
        <ul className="mt-1 space-y-0.5 text-xs text-muted">
          {context.recommendedCoordinationAreas.map((area) => (
            <li key={area}>· {area}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function CooWorkspace({
  missions,
  tasks,
  decisionAttention,
}: {
  missions: Mission[];
  tasks: Task[];
  decisionAttention: DecisionAttentionItem[];
}) {
  const { pipeline, board, bottlenecks, workflow, recommendations } = useCooWorkspace({
    missions,
    tasks,
    decisionAttention,
  });
  const selectedView = useCooWorkspaceStore((s) => s.selectedView);
  const setSelectedView = useCooWorkspaceStore((s) => s.setSelectedView);

  const views = [
    { id: "pipeline" as const, label: "Pipeline" },
    { id: "board" as const, label: "Board" },
    { id: "workflow" as const, label: "Workflow" },
    { id: "bottlenecks" as const, label: "Bottlenecks" },
    { id: "recommendations" as const, label: "Recommendations" },
    { id: "context" as const, label: "Decision Context" },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">{cooWorkspaceAdvisoryNote}</p>

      <div className="flex flex-wrap gap-2">
        {views.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setSelectedView(v.id)}
            className={cn(
              "rounded-full border border-border px-3 py-1 text-xs transition",
              selectedView === v.id
                ? "border-accent bg-accent/10 text-accent"
                : "text-muted hover:border-accent/40"
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      <Card title="Mission Pipeline" description="Active missions across COO pipeline stages">
        <CooMissionPipeline rows={pipeline} />
      </Card>

      <Card title="Mission Board" description="Delivery-oriented mission cards with stage and blockers">
        <CooMissionBoard items={board} />
      </Card>

      <Card title="Workflow Overview" description="Stage distribution for operational continuity reading">
        <CooWorkflowOverview summary={workflow} />
      </Card>

      <Card
        title="Bottlenecks"
        description="Rule-based observations—potential bottleneck and review suggested only"
      >
        <CooBottleneckPanel bottlenecks={bottlenecks} />
      </Card>

      <Card
        title="Recommendations"
        description="Advisory coordination notes—not prioritization or execution"
      >
        <CooRecommendationsPanel recommendations={recommendations} />
      </Card>

      <Card
        title="Decision Context"
        description="Links to governance knowledge, atlas, traceability, and replay for continuity reading"
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <Link href="/ceo-home" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Executive replay & governance on CEO Home
          </Link>
          <Link href="/organization-feed" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Organization Feed — COO coordination events
          </Link>
          <Link href="/delivery-workspace" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Mission Delivery
          </Link>
          <Link href="/repository-workspace" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Repository Coordination
          </Link>
          <Link href="/release-workspace" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Release Readiness
          </Link>
          <Link href="/code-release-workspace" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Release → Outcome
          </Link>
          <Link href="/runtime-cost" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Runtime — knowledge graph & traceability context
          </Link>
          <Link href="/memory" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Decision memory atlas continuity
          </Link>
        </div>
      </Card>
    </div>
  );
}
