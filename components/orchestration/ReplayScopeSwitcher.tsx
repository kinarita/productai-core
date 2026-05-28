import { ReplayFilterChips } from "@/components/orchestration/ReplayFilterChips";
import type { ReplayScope } from "@/lib/replay-query/replayQueryTypes";

const scopeOptions: { id: ReplayScope; label: string }[] = [
  { id: "organization", label: "Organization-wide" },
  { id: "mission", label: "Mission-focused" },
  { id: "runtime", label: "Runtime continuity" },
  { id: "continuity", label: "Continuity" },
  { id: "governance_review", label: "Governance review" },
];

export function ReplayScopeSwitcher({
  value,
  onChange,
}: {
  value: ReplayScope;
  onChange: (value: ReplayScope) => void;
}) {
  return <ReplayFilterChips value={value} options={scopeOptions} onChange={(v) => onChange(v as ReplayScope)} />;
}
