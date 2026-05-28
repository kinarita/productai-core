import Link from "next/link";

export function ReplayNavigationContext({
  runtimeHref,
  feedHref,
}: {
  runtimeHref: string;
  feedHref: string;
}) {
  return (
    <div className="flex flex-wrap gap-3 text-xs">
      <Link href={runtimeHref} className="font-medium text-accent hover:underline">
        Open Runtime Replay →
      </Link>
      <Link href={feedHref} className="font-medium text-accent hover:underline">
        Open Governance Feed →
      </Link>
    </div>
  );
}
