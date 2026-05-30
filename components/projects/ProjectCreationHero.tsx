"use client";

import { projectCreationExamples } from "@/lib/project-creation/projectCreationTypes";

export function ProjectCreationHero({
  idea,
  onIdeaChange,
  onStart,
}: {
  idea: string;
  onIdeaChange: (value: string) => void;
  onStart: () => void;
}) {
  return (
    <section className="rounded-2xl border border-accent/25 bg-gradient-to-br from-indigo-50/80 to-background px-6 py-10 shadow-sm">
      <p className="text-center text-sm font-medium uppercase tracking-wide text-accent">
        AI software creation
      </p>
      <h2 className="mt-2 text-center text-2xl font-semibold text-foreground sm:text-3xl">
        What would you like to build?
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-center text-sm text-muted">
        Describe your app in plain language. Your AI team will plan, design, and prepare the build—
        you stay in control.
      </p>

      <div className="mx-auto mt-6 max-w-xl">
        <label htmlFor="project-idea-input" className="sr-only">
          Project idea
        </label>
        <textarea
          id="project-idea-input"
          value={idea}
          onChange={(e) => onIdeaChange(e.target.value)}
          rows={3}
          placeholder="e.g. A mobile app that helps families track shared expenses…"
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {projectCreationExamples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => onIdeaChange(example)}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent/40 hover:text-foreground"
          >
            {example}
          </button>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={onStart}
          disabled={!idea.trim()}
          className="rounded-xl bg-accent px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Start AI Team
        </button>
      </div>
    </section>
  );
}
