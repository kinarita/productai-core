import type { MissionRecord } from "@/lib/domain/mission";
import { apiClient } from "@/lib/services/apiClient";

export async function fetchMissionsFromApi(
  params: { missionId?: string; status?: string } = {}
): Promise<MissionRecord[]> {
  const query = new URLSearchParams();
  if (params.missionId) query.set("mission", params.missionId);
  if (params.status) query.set("status", params.status);
  const url = `/api/missions${query.size ? `?${query.toString()}` : ""}`;
  const data = await apiClient<{ missions: MissionRecord[] }>(url);
  return data.missions;
}
