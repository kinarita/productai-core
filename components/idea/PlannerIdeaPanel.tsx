"use client";

import Link from "next/link";
import type { PlannerIdeaView } from "@/lib/idea/ideaAnalysis";
import type { ProductIdea, IdeaStateId } from "@/lib/idea/ideaWorkspace";
import { ideaStateLabel } from "@/lib/idea/ideaWorkspace";

export function PlannerIdeaPanel({ view }: { view: PlannerIdeaView }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">{view.advisoryNote}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Bucket title="Active Ideas" ideas={view.activeIdeas} />
        <Bucket title="Product Brief Drafts" ideas={view.productBriefDrafts} />
        <Bucket title="Pending Reviews" ideas={view.pendingReviews} />
      </div>
      <Link href="/idea-workspace" className="inline-block text-xs text-accent hover:underline">
        Open Idea Workspace
      </Link>
    </div>
  );
}

function Bucket({
  title,
  ideas,
}: {
  title: string;
  ideas: ProductIdea[];
}) {
  return (
    <div className="rounded-lg border border-border px-3 py-2">
      <p className="text-[10px] font-medium uppercase text-muted">{title}</p>
      <p className="mt-1 text-lg font-semibold">{ideas.length}</p>
      {ideas.length > 0 ? (
        <ul className="mt-2 space-y-1 text-xs text-muted">
          {ideas.slice(0, 3).map((idea) => (
            <li key={idea.ideaId}>
              <Link
                href={`/idea-workspace?idea=${idea.ideaId}`}
                className="text-accent hover:underline"
              >
                {idea.title}
              </Link>
              {" · "}
              {ideaStateLabel(idea.status)}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
