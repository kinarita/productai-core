import { Suspense } from "react";
import { ArchitectWorkspaceView } from "@/components/architect/ArchitectWorkspaceView";

export default function ArchitectWorkspacePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted">Loading Architect workspace…</div>}>
      <ArchitectWorkspaceView />
    </Suspense>
  );
}
