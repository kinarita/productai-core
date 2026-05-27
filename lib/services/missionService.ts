import type { MissionRecord } from "@/lib/domain/mission";

export async function fetchMissionsFromApi(
  params: { missionId?: string; status?: string } = {}
): Promise<MissionRecord[]> {
  const query = new URLSearchParams();
  if (params.missionId) query.set("mission", params.missionId);
  if (params.status) query.set("status", params.status);
  const url = `/api/missions${query.size ? `?${query.toString()}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch missions: ${res.status}`);
  }
  const json = (await res.json()) as { missions: MissionRecord[] };
  return json.missions;
}
