import { ProjectHubView } from "@/components/projects/ProjectHubView";

export default async function ProjectHubPage({
  params,
}: {
  params: Promise<{ missionId: string }>;
}) {
  const { missionId } = await params;
  return <ProjectHubView missionId={missionId} />;
}
