import { Suspense } from "react";
import { DesignerWorkspaceView } from "@/components/designer/DesignerWorkspaceView";

export default function DesignerWorkspacePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted">Loading Designer workspace…</div>}>
      <DesignerWorkspaceView />
    </Suspense>
  );
}
