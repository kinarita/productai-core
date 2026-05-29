import { Suspense } from "react";
import { DeliveryWorkspaceView } from "@/components/delivery/DeliveryWorkspaceView";

export default function DeliveryWorkspacePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted">Loading delivery workspace…</div>}>
      <DeliveryWorkspaceView />
    </Suspense>
  );
}
