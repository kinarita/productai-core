import { Suspense } from "react";
import { ProductBriefWorkspaceView } from "@/components/brief/ProductBriefWorkspaceView";

export default function ProductBriefPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted">Loading Product Brief workspace…</div>}>
      <ProductBriefWorkspaceView />
    </Suspense>
  );
}
