import { Suspense } from "react";
import { AiTeamView } from "@/components/ai-team/AiTeamView";

export default function AiTeamPage() {
  return (
    <Suspense fallback={null}>
      <AiTeamView />
    </Suspense>
  );
}
