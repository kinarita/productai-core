export function ContinuityScoreBreakdown({
  breakdown,
}: {
  breakdown: {
    runtimeStability: number;
    advisoryDensity: number;
    reviewLoad: number;
    blockerDensity: number;
    governanceContinuity: number;
  };
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-xs font-medium uppercase text-muted">Explain score</p>
      <ul className="mt-2 space-y-1 text-xs text-muted">
        <li>Runtime stability: {breakdown.runtimeStability}</li>
        <li>Advisory density: {breakdown.advisoryDensity}</li>
        <li>Review load: {breakdown.reviewLoad}</li>
        <li>Blocker density: {breakdown.blockerDensity}</li>
        <li>Governance continuity: {breakdown.governanceContinuity}</li>
      </ul>
    </div>
  );
}
