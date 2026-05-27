"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { getMissionById } from "@/data/missionHelpers";

interface MissionFilterBannerProps {
  missionId: string;
  basePath: string;
}

export function MissionFilterBanner({ missionId, basePath }: MissionFilterBannerProps) {
  const mission = getMissionById(missionId);

  if (!mission) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-indigo-200 bg-indigo-50/50 px-4 py-3">
      <p className="text-sm text-foreground">
        Filtered by mission:{" "}
        <Link href={`/missions/${missionId}`} className="font-medium text-accent hover:underline">
          {mission.name}
        </Link>
      </p>
      <Link
        href={basePath}
        className="inline-flex items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-foreground"
      >
        <X className="h-3 w-3" />
        Clear filter
      </Link>
    </div>
  );
}
