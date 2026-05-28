export function resolveMissionLabel(input: {
  missionId: string;
  missionName?: string;
  missionNameMap?: Record<string, string>;
}): string {
  if (input.missionName) return input.missionName;
  if (input.missionNameMap?.[input.missionId]) return input.missionNameMap[input.missionId];
  return input.missionId;
}
