import { CeoHomeView } from "@/components/ceo-home/CeoHomeView";

interface CeoHomePageProps {
  searchParams: Promise<{
    severity?: string;
    mission?: string;
    governance?: string;
    continuity?: string;
    advisory?: string;
  }>;
}

export default async function CeoHomePage({ searchParams }: CeoHomePageProps) {
  const { severity, mission, governance, continuity, advisory } = await searchParams;
  return (
    <CeoHomeView
      severityFilter={severity}
      missionFilter={mission}
      governanceFilter={governance}
      continuityFilter={continuity}
      advisoryFilter={advisory}
    />
  );
}
