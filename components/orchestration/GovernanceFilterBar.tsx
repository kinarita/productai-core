interface GovernanceFilterBarProps {
  category: string;
  severity: string;
  advisory: string;
  mission: string;
  review: string;
  continuity: string;
  missionOptions: { id: string; label: string }[];
  onChange: (key: "category" | "severity" | "advisory" | "mission" | "review" | "continuity", value: string) => void;
}

export function GovernanceFilterBar({
  category,
  severity,
  advisory,
  mission,
  review,
  continuity,
  missionOptions,
  onChange,
}: GovernanceFilterBarProps) {
  const baseClass =
    "mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground";
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
      <label className="text-xs text-muted">
        Category
        <select value={category} onChange={(e) => onChange("category", e.target.value)} className={baseClass}>
          <option value="all">All categories</option>
          <option value="runtime_stability">runtime stability</option>
          <option value="provider_instability">provider instability</option>
          <option value="sync_instability">sync instability</option>
          <option value="dependency_blocker">dependency blocker</option>
          <option value="governance_review">governance review</option>
          <option value="elevated_risk">elevated risk</option>
        </select>
      </label>
      <label className="text-xs text-muted">
        Severity
        <select value={severity} onChange={(e) => onChange("severity", e.target.value)} className={baseClass}>
          <option value="all">All severities</option>
          <option value="low">low</option>
          <option value="moderate">moderate</option>
          <option value="elevated">elevated</option>
          <option value="critical_review">critical review</option>
        </select>
      </label>
      <label className="text-xs text-muted">
        Advisory
        <select value={advisory} onChange={(e) => onChange("advisory", e.target.value)} className={baseClass}>
          <option value="all">All</option>
          <option value="advisory">Advisory only</option>
          <option value="decision">Governance decision</option>
        </select>
      </label>
      <label className="text-xs text-muted">
        Mission
        <select value={mission} onChange={(e) => onChange("mission", e.target.value)} className={baseClass}>
          <option value="all">All missions</option>
          {missionOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs text-muted">
        Review state
        <select value={review} onChange={(e) => onChange("review", e.target.value)} className={baseClass}>
          <option value="all">All states</option>
          <option value="processing_review_required">review required</option>
          <option value="processing_active">active</option>
          <option value="processing_paused">paused</option>
          <option value="processing_denied">denied</option>
          <option value="processing_revoked">revoked</option>
        </select>
      </label>
      <label className="text-xs text-muted">
        Continuity
        <select value={continuity} onChange={(e) => onChange("continuity", e.target.value)} className={baseClass}>
          <option value="all">All</option>
          <option value="stable">stable</option>
          <option value="degraded">degraded</option>
        </select>
      </label>
    </div>
  );
}
