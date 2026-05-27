import { OrganizationFeedView } from "@/components/organization-feed/OrganizationFeedView";

interface OrganizationFeedPageProps {
  searchParams: Promise<{ mission?: string }>;
}

export default async function OrganizationFeedPage({
  searchParams,
}: OrganizationFeedPageProps) {
  const { mission } = await searchParams;
  return <OrganizationFeedView missionFilter={mission} />;
}
