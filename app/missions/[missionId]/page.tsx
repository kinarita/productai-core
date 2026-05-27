import { notFound } from "next/navigation";
import { missions } from "@/data/mockData";
import { MissionDetailView } from "@/components/missions/MissionDetailView";

interface MissionDetailPageProps {
  params: Promise<{ missionId: string }>;
}

/** Validates route exists in seed data; rendering is fully client + store driven. */
export default async function MissionDetailPage({ params }: MissionDetailPageProps) {
  const { missionId } = await params;

  if (!missions.some((m) => m.id === missionId)) {
    notFound();
  }

  return <MissionDetailView missionId={missionId} />;
}
