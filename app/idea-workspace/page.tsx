import { Suspense } from "react";
import { IdeaWorkspaceView } from "@/components/idea/IdeaWorkspaceView";

export default function IdeaWorkspacePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted">Loading CEO Idea workspace…</div>}>
      <IdeaWorkspaceView />
    </Suspense>
  );
}
