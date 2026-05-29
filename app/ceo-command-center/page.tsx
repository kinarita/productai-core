import { Suspense } from "react";
import { CeoCommandCenterView } from "@/components/ceo-command/CeoCommandCenterView";

export default function CeoCommandCenterPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted">Loading CEO Command Center…</div>}>
      <CeoCommandCenterView />
    </Suspense>
  );
}
