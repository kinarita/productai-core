import { JudgmentView } from "@/components/judgment/JudgmentView";
import { parseReplayQuery } from "@/lib/replay-query/replayQueryParser";

interface JudgmentPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function JudgmentPage({ searchParams }: JudgmentPageProps) {
  const params = await searchParams;
  const replayQuery = parseReplayQuery(params);
  const mission = typeof params.mission === "string" ? params.mission : undefined;
  return <JudgmentView missionFilter={mission} replayQuery={replayQuery} />;
}
