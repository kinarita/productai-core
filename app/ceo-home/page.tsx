import { CeoHomeView } from "@/components/ceo-home/CeoHomeView";
import { parseReplayQuery } from "@/lib/replay-query/replayQueryParser";

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
  const replayQuery = parseReplayQuery(await searchParams);
  return <CeoHomeView replayQuery={replayQuery} />;
}
