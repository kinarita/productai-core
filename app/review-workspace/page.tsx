import { Suspense } from "react";
import { CrossReviewWorkspaceView } from "@/components/cross-review/CrossReviewWorkspaceView";

export default function ReviewWorkspacePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted">Loading review workspace…</div>}>
      <CrossReviewWorkspaceView />
    </Suspense>
  );
}
