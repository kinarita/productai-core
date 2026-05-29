"use client";

import type { MvpScope } from "@/lib/idea/mvpScoping";

export function MvpScopePanel({ scope }: { scope: MvpScope }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <ScopeList title="Must Have" items={scope.mustHave} accent />
      <ScopeList title="Should Have" items={scope.shouldHave} />
      <ScopeList title="Could Have" items={scope.couldHave} />
      <ScopeList title="Out Of Scope" items={scope.outOfScope} muted />
    </div>
  );
}

function ScopeList({
  title,
  items,
  accent,
  muted,
}: {
  title: string;
  items: string[];
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={
        accent
          ? "rounded-lg border border-accent/30 bg-accent/5 px-3 py-2"
          : muted
            ? "rounded-lg border border-border/60 px-3 py-2 opacity-80"
            : "rounded-lg border border-border px-3 py-2"
      }
    >
      <p className="text-[10px] font-medium uppercase text-muted">{title}</p>
      <ul className="mt-1 space-y-0.5 text-xs text-foreground">
        {items.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
    </div>
  );
}
