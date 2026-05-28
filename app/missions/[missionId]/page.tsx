import { notFound } from "next/navigation";
import { missions } from "@/data/mockData";
import { MissionDetailView } from "@/components/missions/MissionDetailView";

interface MissionDetailPageProps {
  params: Promise<{ missionId: string }>;
  searchParams: Promise<{
    severity?: string;
    governance?: string;
    continuity?: string;
    advisory?: string;
  }>;
}

/** Validates route exists in seed data; rendering is fully client + store driven. */
export default async function MissionDetailPage({ params, searchParams }: MissionDetailPageProps) {
  const { missionId } = await params;
  const { severity, governance, continuity, advisory } = await searchParams;

  if (!missions.some((m) => m.id === missionId)) {
    notFound();
  }

  return (
    <MissionDetailView
      missionId={missionId}
      severityFilter={severity}
      governanceFilter={governance}
      continuityFilter={continuity}
      advisoryFilter={advisory}
    />
  );
}
