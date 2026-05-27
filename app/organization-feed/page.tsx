import { OrganizationFeedView } from "@/components/organization-feed/OrganizationFeedView";

interface OrganizationFeedPageProps {
  searchParams: Promise<{ mission?: string; task?: string; type?: string; status?: string }>;
}

export default async function OrganizationFeedPage({
  searchParams,
}: OrganizationFeedPageProps) {
  const { mission, task, type, status } = await searchParams;
  return (
    <OrganizationFeedView
      missionFilter={mission}
      taskFilter={task}
      typeFilter={type}
      statusFilter={status}
    />
  );
}
