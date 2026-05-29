"use client";

import Link from "next/link";
import type { DependencyMapCard } from "@/lib/director/dependencyMap";

export function DependencyMapPanel({ cards }: { cards: DependencyMapCard[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {cards.map((card, i) => (
        <div key={`${card.category}-${i}`} className="rounded-lg border border-border px-3 py-2 text-xs">
          <p className="text-[10px] uppercase text-muted">{card.category}</p>
          {card.href ? (
            <Link href={card.href} className="font-medium text-accent hover:underline">
              {card.title}
            </Link>
          ) : (
            <p className="font-medium text-foreground">{card.title}</p>
          )}
          <p className="mt-1 text-muted">{card.detail}</p>
        </div>
      ))}
    </div>
  );
}
