import type { JudgmentRecord } from "@/lib/domain/judgment";
import { apiClient } from "@/lib/services/apiClient";

export async function fetchJudgments(params: {
  missionId?: string;
  status?: string;
} = {}): Promise<JudgmentRecord[]> {
  const query = new URLSearchParams();
  if (params.missionId) query.set("mission", params.missionId);
  if (params.status) query.set("status", params.status);
  const data = await apiClient<{ judgments: JudgmentRecord[] }>(
    `/api/judgments${query.size ? `?${query.toString()}` : ""}`
  );
  return data.judgments;
}

export async function updateDecisionStatus(
  decisionId: string,
  patch: { status: string; selectedOption?: string | null; updatedAt?: string }
): Promise<JudgmentRecord> {
  const data = await apiClient<{ judgment: JudgmentRecord }>(`/api/judgments/${decisionId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return data.judgment;
}
