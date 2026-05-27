import type { FeedItemRecord } from "@/lib/domain/feed";
import { apiClient } from "@/lib/services/apiClient";

interface CreateFeedInput {
  missionId: string;
  taskId?: string | null;
  decisionId?: string | null;
  type: string;
  status?: string | null;
  message: string;
  agentId?: string;
  title?: string;
  author?: string;
  authorName?: string;
}

export async function fetchFeed(params: {
  missionId?: string;
  taskId?: string;
  type?: string;
  status?: string;
} = {}): Promise<FeedItemRecord[]> {
  const query = new URLSearchParams();
  if (params.missionId) query.set("mission", params.missionId);
  if (params.taskId) query.set("task", params.taskId);
  if (params.type) query.set("type", params.type);
  if (params.status) query.set("status", params.status);
  const data = await apiClient<{ feed: FeedItemRecord[] }>(
    `/api/feed${query.size ? `?${query.toString()}` : ""}`
  );
  return data.feed;
}

export async function createFeedItem(input: CreateFeedInput): Promise<FeedItemRecord> {
  const data = await apiClient<{ feedItem: FeedItemRecord }>("/api/feed", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.feedItem;
}
