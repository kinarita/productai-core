import { ReplayFilterChips } from "@/components/orchestration/ReplayFilterChips";
import type { ReplayWindow } from "@/lib/replay-query/replayQueryTypes";

const windowOptions: { id: ReplayWindow; label: string }[] = [
  { id: "latest", label: "Latest" },
  { id: "short", label: "Short" },
  { id: "medium", label: "Medium" },
  { id: "extended", label: "Extended" },
];

export function ReplayWindowSelector({
  value,
  onChange,
}: {
  value: ReplayWindow;
  onChange: (value: ReplayWindow) => void;
}) {
  return <ReplayFilterChips value={value} options={windowOptions} onChange={(v) => onChange(v as ReplayWindow)} />;
}
