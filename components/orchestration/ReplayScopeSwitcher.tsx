import { ReplayFilterChips } from "@/components/orchestration/ReplayFilterChips";
import type { ReplayScope } from "@/lib/replay-query/replayQueryTypes";
import { replayScopeOptions } from "@/lib/replay-query/replayTokens";

export function ReplayScopeSwitcher({
  value,
  onChange,
}: {
  value: ReplayScope;
  onChange: (value: ReplayScope) => void;
}) {
  return (
    <ReplayFilterChips
      value={value}
      options={replayScopeOptions()}
      onChange={(v) => onChange(v as ReplayScope)}
    />
  );
}
