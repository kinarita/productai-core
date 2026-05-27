import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { memories } from "@/data/mockData";
import { BookMarked } from "lucide-react";

const categoryLabels = {
  learning: "Organizational Learning",
  architecture: "Architecture Wisdom",
  incident: "Incident Lesson",
  pattern: "Successful Pattern",
};

const categoryVariant = {
  learning: "default" as const,
  architecture: "accent" as const,
  incident: "warning" as const,
  pattern: "success" as const,
};

export default function MemoryPage() {
  return (
    <AppShell
      title="Memory Vault"
      description="Organizational wisdom — quietly preserved for future missions"
    >
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted">
        These memories are not logs. They are distilled learnings that guide how your AI
        organization builds software over time.
      </p>

      <div className="grid gap-4">
        {memories.map((memory) => (
          <Card key={memory.id} className="border-border/80 bg-background">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-muted">
                <BookMarked className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={categoryVariant[memory.category]}>
                    {categoryLabels[memory.category]}
                  </Badge>
                  {memory.mission && (
                    <span className="text-xs text-muted">{memory.mission}</span>
                  )}
                  <span className="text-xs text-muted">· {memory.createdAt}</span>
                </div>
                <h3 className="mt-2 text-base font-medium text-foreground">{memory.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{memory.summary}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {memory.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-surface px-2 py-0.5 text-xs text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
