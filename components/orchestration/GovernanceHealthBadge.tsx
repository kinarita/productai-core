export function GovernanceHealthBadge({ score }: { score: number }) {
  const variant =
    score >= 85
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : score >= 65
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-rose-200 bg-rose-50 text-rose-800";
  const label = score >= 85 ? "stable" : score >= 65 ? "moderate advisory" : "review priority";
  return (
    <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${variant}`}>
      {label} · {score}
    </span>
  );
}
