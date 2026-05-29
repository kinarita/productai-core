import { Suspense } from "react";
import { OutcomeWorkspaceView } from "@/components/outcome/OutcomeWorkspaceView";

export default function CodeReleaseWorkspacePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted">Loading Code & Release workspace…</div>}>
      <OutcomeWorkspaceView />
    </Suspense>
  );
}
