"use client";

import Link from "next/link";
import { getMissionById } from "@/data/missionHelpers";
import { cn } from "@/lib/utils";

type MissionLinkVariant = "pill" | "link" | "subtle";

interface MissionLinkProps {
  missionId: string;
  missionName?: string;
  variant?: MissionLinkVariant;
  className?: string;
  children?: React.ReactNode;
}

const variantStyles: Record<MissionLinkVariant, string> = {
  pill: "inline-flex items-center rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-accent transition-colors hover:bg-indigo-100",
  link: "text-sm font-medium text-accent transition-colors hover:underline",
  subtle: "text-xs text-muted transition-colors hover:text-accent",
};

export function MissionLink({
  missionId,
  missionName,
  variant = "link",
  className,
  children,
}: MissionLinkProps) {
  const mission = getMissionById(missionId);
  const label = children ?? missionName ?? mission?.name ?? "Mission";

  if (!mission && !missionName) {
    return <span className={cn(variantStyles[variant], className)}>{label}</span>;
  }

  return (
    <Link
      href={`/missions/${missionId}`}
      className={cn(variantStyles[variant], className)}
    >
      {label}
    </Link>
  );
}
