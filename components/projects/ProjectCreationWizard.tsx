"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import type { DiscoveryMode, ProjectWizardStep } from "@/lib/project-creation/projectCreationTypes";
import { discoveryModeDisplayTitle } from "@/lib/project-creation/discoveryModeLabels";
import { usePlannerAgentStore } from "@/lib/store/plannerAgentStore";
import { useProjectCreationStore } from "@/lib/store/projectCreationStore";
import { cn } from "@/lib/utils";

const stepTitles: Record<ProjectWizardStep, string> = {
  1: "誰のためのプロダクトか",
  2: "成功のイメージ",
  3: "内容の確認",
};

const WIZARD_STEPS: ProjectWizardStep[] = [1, 2, 3];

export function ProjectCreationWizard({
  initialIdea,
  initialDiscoveryMode,
  open,
  onClose,
}: {
  initialIdea: string;
  initialDiscoveryMode: DiscoveryMode;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const createProject = useProjectCreationStore((s) => s.createProject);
  const [step, setStep] = useState<ProjectWizardStep>(1);
  const [targetUsers, setTargetUsers] = useState("");
  const [successGoal, setSuccessGoal] = useState("");
  const [creating, setCreating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setStep(1);
      setTargetUsers("");
      setSuccessGoal("");
      setCreating(false);
    }
  }, [open, initialIdea, initialDiscoveryMode]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open || !mounted) return null;

  const idea = initialIdea.trim();
  const discoveryMode = initialDiscoveryMode;

  const canNext =
    (step === 1 && targetUsers.trim().length > 0) ||
    (step === 2 && successGoal.trim().length > 0) ||
    step === 3;

  const handleCreate = async () => {
    setCreating(true);
    const missionId = createProject({
      idea,
      targetUsers,
      successGoal,
      discoveryMode,
    });
    void usePlannerAgentStore.getState().generateForMission(missionId);
    onClose();
    router.push(`/projects/${missionId}`);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
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
            閉じる
          </button>
        </div>

        <div className="mb-6 flex gap-1">
          {WIZARD_STEPS.map((s) => (
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
          <div className="space-y-4">
            <p className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted">
              <span className="font-medium text-foreground">アイデア:</span> {idea}
              <br />
              <span className="font-medium text-foreground">はじめ方:</span>{" "}
              {discoveryModeDisplayTitle(discoveryMode)}
            </p>
            <textarea
              value={targetUsers}
              onChange={(e) => setTargetUsers(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              placeholder="誰が使いますか？（例：家族、学生、小規模チーム…）"
              autoFocus
            />
          </div>
        ) : null}

        {step === 2 ? (
          <textarea
            value={successGoal}
            onChange={(e) => setSuccessGoal(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            placeholder="3ヶ月後、どうなっていたら成功ですか？"
            autoFocus
          />
        ) : null}

        {step === 3 ? (
          <div className="space-y-3 rounded-lg border border-border bg-surface p-4 text-sm">
            <p>
              <span className="font-medium text-foreground">アイデア:</span>{" "}
              <span className="text-muted">{idea}</span>
            </p>
            <p>
              <span className="font-medium text-foreground">はじめ方:</span>{" "}
              <span className="text-muted">{discoveryModeDisplayTitle(discoveryMode)}</span>
            </p>
            <p>
              <span className="font-medium text-foreground">ユーザー:</span>{" "}
              <span className="text-muted">{targetUsers}</span>
            </p>
            <p>
              <span className="font-medium text-foreground">成功:</span>{" "}
              <span className="text-muted">{successGoal}</span>
            </p>
            <p className="text-xs text-muted">
              Plannerが作る価値を整理し、必要な質問だけ行ったあと、Product Briefを作成します。
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
            戻る
          </button>
          {step < 3 ? (
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setStep((s) => (s < 3 ? ((s + 1) as ProjectWizardStep) : s))}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              次へ
            </button>
          ) : (
            <button
              type="button"
              disabled={creating}
              onClick={handleCreate}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              {creating ? "開始中…" : "AIチームに依頼する"}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
