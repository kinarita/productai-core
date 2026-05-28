import { ReplayFilterChips } from "@/components/orchestration/ReplayFilterChips";
import type { ReplayWindow } from "@/lib/replay-query/replayQueryTypes";
import { replayWindowOptions } from "@/lib/replay-query/replayTokens";

export function ReplayWindowSelector({
  value,
  onChange,
}: {
  value: ReplayWindow;
  onChange: (value: ReplayWindow) => void;
}) {
  return (
    <ReplayFilterChips
      value={value}
      options={replayWindowOptions()}
      onChange={(v) => onChange(v as ReplayWindow)}
    />
  );
}
