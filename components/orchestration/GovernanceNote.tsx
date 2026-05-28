import { cn } from "@/lib/utils";

interface GovernanceNoteProps {
  children: string;
  className?: string;
}

export function GovernanceNote({ children, className }: GovernanceNoteProps) {
  return (
    <p
      className={cn(
        "rounded-lg border border-border bg-surface px-3 py-2 text-xs leading-relaxed text-muted",
        className
      )}
    >
      {children}
    </p>
  );
}