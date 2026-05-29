import { Suspense } from "react";
import { ReleaseReadinessView } from "@/components/release/ReleaseReadinessView";

export default function ReleaseWorkspacePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted">Loading release workspace…</div>}>
      <ReleaseReadinessView />
    </Suspense>
  );
}
