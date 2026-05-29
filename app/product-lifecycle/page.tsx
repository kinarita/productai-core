import { Suspense } from "react";
import { LifecycleWorkspaceView } from "@/components/lifecycle/LifecycleWorkspaceView";

export default function ProductLifecyclePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted">Loading Product Lifecycle workspace…</div>}>
      <LifecycleWorkspaceView />
    </Suspense>
  );
}
