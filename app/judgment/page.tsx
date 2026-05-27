import { JudgmentView } from "@/components/judgment/JudgmentView";

interface JudgmentPageProps {
  searchParams: Promise<{ mission?: string }>;
}

export default async function JudgmentPage({ searchParams }: JudgmentPageProps) {
  const { mission } = await searchParams;
  return <JudgmentView missionFilter={mission} />;
}
