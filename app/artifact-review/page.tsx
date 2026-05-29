import { Suspense } from "react";
import { ArtifactReviewView } from "@/components/review/ArtifactReviewView";

export default function ArtifactReviewPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted">Loading Artifact Review workspace…</div>}>
      <ArtifactReviewView />
    </Suspense>
  );
}
