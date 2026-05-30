"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProjectWizardStep } from "@/lib/project-creation/projectCreationTypes";
import { useProjectCreationStore } from "@/lib/store/projectCreationStore";
import { cn } from "@/lib/utils";

const stepTitles: Record<ProjectWizardStep, string> = {
  1: "Project Idea",
  2: "Target Users",
  3: "Success Goal",
  4: "Create Project",
};

export function ProjectCreationWizard({
  initialIdea,
  open,
  onClose,
}: {
  initialIdea: string;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const createProject = useProjectCreationStore((s) => s.createProject);
  const [step, setStep] = useState<ProjectWizardStep>(1);
  const [idea, setIdea] = useState(initialIdea);
  const [targetUsers, setTargetUsers] = useState("");
  const [successGoal, setSuccessGoal] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open) {
      setIdea(initialIdea);
      setStep(1);
      setTargetUsers("");
      setSuccessGoal("");
      setCreating(false);
    }
  }, [open, initialIdea]);

  if (!open) return null;

  const canNext =
    (step === 1 && idea.trim().length > 0) ||
    (step === 2 && targetUsers.trim().length > 0) ||
    (step === 3 && successGoal.trim().length > 0) ||
    step === 4;

  const handleCreate = () => {
    setCreating(true);
    const missionId = createProject({ idea, targetUsers, successGoal });
    onClose();
    router.push(`/projects/${missionId}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 id="wizard-title" className="text-lg font-semibold text-foreground">
            {stepTitles[step]}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-muted hover:text-foreground"
          >
            Close
          </button>
        </div>

        <div className="mb-6 flex gap-1">
          {([1, 2, 3, 4] as ProjectWizardStep[]).map((s) => (
            <div
              key={s}
              className={cn(
                "h-1 flex-1 rounded-full",
                s <= step ? "bg-accent" : "bg-border"
              )}
            />
          ))}
        </div>

        {step === 1 ? (
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            placeholder="Describe what you want to build…"
          />
        ) : null}

        {step === 2 ? (
          <textarea
            value={targetUsers}
            onChange={(e) => setTargetUsers(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            placeholder="Who will use this? (e.g. small business owners, parents, students…)"
          />
        ) : null}

        {step === 3 ? (
          <textarea
            value={successGoal}
            onChange={(e) => setSuccessGoal(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            placeholder="What does success look like in 3 months?"
          />
        ) : null}

        {step === 4 ? (
          <div className="space-y-3 rounded-lg border border-border bg-surface p-4 text-sm">
            <p>
              <span className="font-medium text-foreground">Idea:</span>{" "}
              <span className="text-muted">{idea}</span>
            </p>
            <p>
              <span className="font-medium text-foreground">Users:</span>{" "}
              <span className="text-muted">{targetUsers}</span>
            </p>
            <p>
              <span className="font-medium text-foreground">Success:</span>{" "}
              <span className="text-muted">{successGoal}</span>
            </p>
            <p className="text-xs text-muted">
              Product Planner will be assigned immediately and will generate your first Product
              Brief. No code ships automatically.
            </p>
          </div>
        ) : null}

        <div className="mt-6 flex justify-between gap-2">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep((s) => (s > 1 ? ((s - 1) as ProjectWizardStep) : s))}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted disabled:opacity-40"
          >
            Back
          </button>
          {step < 4 ? (
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setStep((s) => (s < 4 ? ((s + 1) as ProjectWizardStep) : s))}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              disabled={creating}
              onClick={handleCreate}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              {creating ? "Creating…" : "Create Project"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
