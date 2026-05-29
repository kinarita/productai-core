import { Suspense } from "react";
import { RepositoryWorkspaceView } from "@/components/repository/RepositoryWorkspaceView";

export default function RepositoryWorkspacePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted">Loading repository workspace…</div>}>
      <RepositoryWorkspaceView />
    </Suspense>
  );
}
