import { cn } from "@/lib/utils";

export function ReplayFilterChips({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { id: string; label: string }[];
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn(
            "rounded-md border px-2 py-1 transition-colors",
            value === option.id
              ? "border-accent bg-indigo-50 text-accent"
              : "border-border bg-background text-muted hover:bg-surface"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
