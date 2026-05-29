"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import { GovernanceReadingModeSwitcher } from "@/components/orchestration/GovernanceReadingModeSwitcher";
import { GovernanceWorkspacePanels } from "@/components/orchestration/GovernanceWorkspacePanels";
import { getGovernanceReadingMode } from "@/lib/orchestration/governance-history/readingModes";
import { useGovernanceWorkspaceStore } from "@/lib/store/governanceWorkspaceStore";
import { buildReplayHref } from "@/lib/replay-query/replayQueryNavigation";
import { mergeReplayQuery } from "@/lib/replay-query/replayQueryParser";
import type { ReplayDiagnostics } from "@/lib/replay-query/replayDiagnostics";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";

interface ExecutiveGovernanceWorkspaceProps {
  replayQuery: ReplayQueryState;
  replayDiagnostics?: ReplayDiagnostics | null;
  interpretationPreset?: string | null;
  linkBasePath?: string;
  missionId?: string;
  onExportDigest?: (text: string) => void;
}

export function ExecutiveGovernanceWorkspace({
  replayQuery,
  replayDiagnostics = null,
  interpretationPreset = null,
  linkBasePath = "/runtime-cost",
  missionId,
  onExportDigest,
}: ExecutiveGovernanceWorkspaceProps) {
  const workspaces = useGovernanceWorkspaceStore((s) => s.workspaces);
  const activeWorkspaceId = useGovernanceWorkspaceStore((s) => s.activeWorkspaceId);
  const activeReadingMode = useGovernanceWorkspaceStore((s) => s.activeReadingMode);
  const createWorkspace = useGovernanceWorkspaceStore((s) => s.createWorkspace);
  const setActiveWorkspace = useGovernanceWorkspaceStore((s) => s.setActiveWorkspace);
  const removeWorkspace = useGovernanceWorkspaceStore((s) => s.removeWorkspace);
  const updateWorkspaceQuery = useGovernanceWorkspaceStore((s) => s.updateWorkspaceQuery);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);
  const mode = getGovernanceReadingMode(activeReadingMode);
  const effectiveQuery = mergeReplayQuery(replayQuery, mode.recommendedReplayQuery);

  const saveWorkspace = () => {
    const label =
      title.trim() ||
      `Governance workspace · ${replayQuery.scope.replaceAll("_", " ")} · ${activeReadingMode.replaceAll("_", " ")}`;
    const workspace = createWorkspace({
      title: label,
      savedReplayQuery: effectiveQuery,
      description: "Executive review continuity workspace—not AI automation.",
      activeReadingMode,
    });
    updateWorkspaceQuery(workspace.id, effectiveQuery);
    setTitle("");
    setMessage("Executive governance workspace saved for reading continuity.");
  };

  return (
    <Card
      title="Executive Governance Workspace"
      description="Longitudinal replay review, reading modes, and interpretation sequencing"
    >
      <p className="text-xs text-muted">
        Longitudinal governance review helps maintain continuity across executive interpretation sessions.
      </p>

      <div className="mt-3">
        <GovernanceReadingModeSwitcher />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Workspace title (optional)"
          className="min-w-[12rem] flex-1 rounded-lg border border-border bg-background px-2 py-1 text-xs"
        />
        <button
          type="button"
          onClick={saveWorkspace}
          className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium text-foreground hover:bg-surface"
        >
          Save workspace
        </button>
        <Link
          href={buildReplayHref(linkBasePath, effectiveQuery)}
          className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium text-accent hover:bg-surface"
        >
          Open mode replay scope →
        </Link>
      </div>
      {message ? <p className="mt-2 text-xs text-foreground">{message}</p> : null}

      {workspaces.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {workspaces.slice(0, 6).map((workspace) => (
            <li
              key={workspace.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs"
            >
              <div>
                <p className="font-medium text-foreground">{workspace.title}</p>
                <p className="text-muted">
                  {workspace.activeReadingMode.replaceAll("_", " ")} ·{" "}
                  {workspace.pinnedInterpretations.length} pinned interpretations ·{" "}
                  {workspace.pinnedJournals.length} journals
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveWorkspace(workspace.id)}
                  className="font-medium text-accent hover:underline"
                >
                  {activeWorkspaceId === workspace.id ? "Active" : "Activate"}
                </button>
                <Link
                  href={buildReplayHref(linkBasePath, workspace.savedReplayQuery)}
                  className="font-medium text-accent hover:underline"
                >
                  Open →
                </Link>
                <button
                  type="button"
                  onClick={() => removeWorkspace(workspace.id)}
                  className="text-muted hover:text-foreground"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4">
        <GovernanceWorkspacePanels
          replayQuery={activeWorkspace?.savedReplayQuery ?? effectiveQuery}
          replayDiagnostics={replayDiagnostics}
          interpretationPreset={interpretationPreset}
          linkBasePath={linkBasePath}
          missionId={missionId}
          onExportDigest={onExportDigest}
        />
      </div>
    </Card>
  );
}
