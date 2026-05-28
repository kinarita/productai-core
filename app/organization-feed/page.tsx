import { OrganizationFeedView } from "@/components/organization-feed/OrganizationFeedView";
import { parseReplayQuery } from "@/lib/replay-query/replayQueryParser";

interface OrganizationFeedPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function OrganizationFeedPage({
  searchParams,
}: OrganizationFeedPageProps) {
  const params = await searchParams;
  const replayQuery = parseReplayQuery(params);
  const mission = typeof params.mission === "string" ? params.mission : undefined;
  const task = typeof params.task === "string" ? params.task : undefined;
  const type = typeof params.type === "string" ? params.type : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;
  const gov = typeof params.gov === "string" ? params.gov : undefined;

  return (
    <OrganizationFeedView
      missionFilter={mission}
      taskFilter={task}
      typeFilter={type}
      statusFilter={status}
      governanceFilter={gov}
      initialReplayQuery={replayQuery}
    />
  );
}
