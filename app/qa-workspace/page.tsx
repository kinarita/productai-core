import { Suspense } from "react";
import { QaWorkspaceView } from "@/components/qa/QaWorkspaceView";

export default function QaWorkspacePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted">Loading QA workspace…</div>}>
      <QaWorkspaceView />
    </Suspense>
  );
}

