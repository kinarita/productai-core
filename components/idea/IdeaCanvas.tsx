"use client";

import type { ProductIdea } from "@/lib/idea/ideaWorkspace";
import { ideaStateLabel } from "@/lib/idea/ideaWorkspace";
import { useIdeaWorkspaceStore } from "@/lib/store/ideaWorkspaceStore";
import { cn } from "@/lib/utils";

export function IdeaCanvas({
  ideas,
  progressNote,
}: {
  ideas: ProductIdea[];
  progressNote?: string;
}) {
  const selectedIdeaId = useIdeaWorkspaceStore((s) => s.selectedIdeaId);
  const setSelectedIdea = useIdeaWorkspaceStore((s) => s.setSelectedIdea);

  return (
    <div className="space-y-4">
      {progressNote ? <p className="text-xs text-muted">{progressNote}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ideas.map((idea) => (
          <button
            key={idea.ideaId}
            type="button"
            onClick={() =>
              setSelectedIdea(selectedIdeaId === idea.ideaId ? null : idea.ideaId)
            }
            className={cn(
              "rounded-lg border border-border px-4 py-3 text-left transition hover:border-accent/40",
              selectedIdeaId === idea.ideaId && "border-accent/60 bg-accent/5"
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">{idea.title}</p>
              <span className="text-[10px] uppercase text-muted">
                {ideaStateLabel(idea.status)}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-xs text-muted">{idea.description}</p>
            {idea.tags.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {idea.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
