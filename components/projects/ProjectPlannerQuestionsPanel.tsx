"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/Card";
import type { PlannerAgentRun } from "@/lib/agents/planner/plannerTypes";
import type { PlannerQuestion } from "@/lib/agents/planner/plannerClarification";
import { usePlannerAgentStore } from "@/lib/store/plannerAgentStore";
import { cn } from "@/lib/utils";

export function ProjectPlannerQuestionsPanel({
  missionId,
  run,
}: {
  missionId: string;
  run?: PlannerAgentRun;
}) {
  const submitClarification = usePlannerAgentStore((s) => s.submitClarification);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [displayQuestions, setDisplayQuestions] = useState<PlannerQuestion[]>([]);
  const [localProcessing, setLocalProcessing] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const mountedRef = useRef(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRoundRef = useRef<number>(-1);

  const clarificationRound = run?.clarificationRound ?? 0;
  const pendingQuestions = run?.pendingQuestions ?? [];
  const status = run?.status;

  const isProcessing =
    localProcessing ||
    status === "assessing" ||
    status === "working" ||
    (status === "completed" && panelVisible);

  const processingMessage =
    status === "working" || status === "completed"
      ? "Planner is creating your Product Brief…"
      : "Planner is reviewing your answers…";

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (status === "awaiting_clarification" && pendingQuestions.length > 0) {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      setPanelVisible(true);
      if (!localProcessing) {
        setDisplayQuestions(pendingQuestions);
      }
      if (clarificationRound !== lastRoundRef.current) {
        lastRoundRef.current = clarificationRound;
        setAnswers({});
        setLocalProcessing(false);
      }
      return;
    }

    if (status === "completed") {
      setLocalProcessing(false);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        if (mountedRef.current) setPanelVisible(false);
      }, 400);
      return;
    }

    if (status === "failed") {
      setLocalProcessing(false);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      setPanelVisible(false);
    }
  }, [status, pendingQuestions, clarificationRound, localProcessing]);

  if (!panelVisible || !run || displayQuestions.length === 0) {
    return null;
  }

  const handleSubmit = async () => {
    if (typeof document !== "undefined") {
      (document.activeElement as HTMLElement | null)?.blur?.();
    }
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    setDisplayQuestions(pendingQuestions);
    setLocalProcessing(true);
    try {
      await submitClarification(missionId, answers);
    } catch {
      if (mountedRef.current && run.status === "awaiting_clarification") {
        setLocalProcessing(false);
      }
    }
  };

  const allAnswered = displayQuestions.every((q) => answers[q.id]?.trim());

  return (
    <Card title="Planner needs additional information">
      <p className="mb-4 text-sm text-muted">
        Your Product Planner reviewed your idea like a PM would—before writing the brief, a few
        details need to be clear.
      </p>
      {run.lastAssessment ? (
        <p className="mb-4 text-xs text-muted">
          Completeness: {run.lastAssessment.completenessScore}% · Missing:{" "}
          {run.lastAssessment.missingAreas.join(", ") || "—"}
        </p>
      ) : null}

      <div className="relative">
        <div
          className={cn(isProcessing && "pointer-events-none select-none opacity-30")}
          aria-hidden={isProcessing}
        >
          <ul className="space-y-5">
            {displayQuestions.map((q) => (
              <li
                key={`${clarificationRound}-${q.id}`}
                className="rounded-lg border border-border bg-surface/60 p-4"
              >
                {q.assumption ? (
                  <p className="text-xs text-muted">
                    <span className="font-medium text-foreground">Planner assumed:</span>{" "}
                    {q.assumption}
                  </p>
                ) : null}
                <p className="mt-2 text-sm font-medium text-foreground">{q.question}</p>
                <p className="mt-2 text-xs text-muted">
                  <span className="font-medium text-foreground">Why this question?</span> {q.reason}
                </p>
                <label
                  className="mt-3 block text-xs font-medium text-muted"
                  htmlFor={`${clarificationRound}-${q.id}`}
                >
                  Your answer
                </label>
                <textarea
                  id={`${clarificationRound}-${q.id}`}
                  rows={2}
                  readOnly={isProcessing}
                  tabIndex={isProcessing ? -1 : 0}
                  value={answers[q.id] ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Answer in plain language…"
                />
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={!allAnswered || isProcessing}
            onClick={() => void handleSubmit()}
            className="mt-4 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          >
            Submit Answers
          </button>
        </div>

        {isProcessing ? (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/70 px-4"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-3 rounded-lg border border-accent/20 bg-indigo-50/90 px-4 py-4 text-sm text-foreground shadow-sm">
              <Loader2 className="h-5 w-5 shrink-0 animate-spin text-accent" aria-hidden />
              <p>{processingMessage}</p>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
