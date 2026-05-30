import { Suspense } from "react";
import { ArtifactLineageWorkspaceView } from "@/components/lineage/ArtifactLineageWorkspaceView";

export default function ArtifactLineagePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted">Loading decision trail…</div>}>
      <ArtifactLineageWorkspaceView />
    </Suspense>
  );
}
