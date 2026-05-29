import { Suspense } from "react";
import { DirectorWorkspaceView } from "@/components/director/DirectorWorkspaceView";

export default function DirectorWorkspacePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted">Loading Director workspace…</div>}>
      <DirectorWorkspaceView />
    </Suspense>
  );
}
