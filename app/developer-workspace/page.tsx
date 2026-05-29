import { Suspense } from "react";
import { DeveloperWorkspaceView } from "@/components/developer/DeveloperWorkspaceView";

export default function DeveloperWorkspacePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted">Loading Developer workspace…</div>}>
      <DeveloperWorkspaceView />
    </Suspense>
  );
}
