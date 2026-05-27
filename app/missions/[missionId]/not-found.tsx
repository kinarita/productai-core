import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";

export default function MissionNotFound() {
  return (
    <AppShell title="Mission Not Found" description="The requested mission does not exist.">
      <Card>
        <p className="text-sm text-muted">
          This mission ID is not in the organization portfolio.
        </p>
        <Link
          href="/missions"
          className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
        >
          ← Back to Products / Missions
        </Link>
      </Card>
    </AppShell>
  );
}
