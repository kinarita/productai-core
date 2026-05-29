import { Suspense } from "react";
import { HandoffWorkspaceView } from "@/components/handoff/HandoffWorkspaceView";

export default function TeamHandoffPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted">Loading AI Team Handoff workspace…</div>}>
      <HandoffWorkspaceView />
    </Suspense>
  );
}
