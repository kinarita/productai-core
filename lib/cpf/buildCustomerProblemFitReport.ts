import type { PlannerClarificationAssessment } from "@/lib/agents/planner/plannerClarification";
import type { OpportunityBrief } from "@/lib/opportunity/opportunityTypes";
import type { ProjectCreationInput } from "@/lib/project-creation/projectCreationTypes";
import type {
  CpfRecommendation,
  CustomerProblemFitReport,
  PainSeverity,
  RankedPainPoint,
} from "@/lib/cpf/cpfTypes";
import type { EvidenceLevel } from "@/lib/opportunity/opportunityTypes";

function severityToBurningWeight(severity: PainSeverity): number {
  switch (severity) {
    case "critical":
      return 28;
    case "high":
      return 20;
    case "medium":
      return 12;
    case "low":
      return 5;
  }
}

function inferEvidenceLevel(cpfScore: number): EvidenceLevel {
  if (cpfScore >= 72) return "high";
  if (cpfScore >= 48) return "medium";
  return "low";
}

function inferRecommendation(cpfScore: number, burningNeed: number): CpfRecommendation {
  const combined = (cpfScore + burningNeed) / 2;
  if (combined >= 68) return "proceed";
  if (combined >= 42) return "validate_more";
  return "hold";
}

/** Rule-based CPF report — runs after Opportunity Discovery (Phase 19). */
export function buildCustomerProblemFitReport(input: {
  projectName: string;
  creation: ProjectCreationInput;
  opportunityBrief?: OpportunityBrief;
  assessment?: PlannerClarificationAssessment;
}): CustomerProblemFitReport {
  const { idea, targetUsers, clarifications, discoveryMode } = input.creation;
  const enriched = `${idea}\n${targetUsers}\n${clarifications ?? ""}`;
  const opp = input.opportunityBrief;
  const isExpense = /家計|expense|budget|ledger|支出|家計簿/i.test(enriched);
  const isFamily =
    /家族|family|夫婦|共働き|household|子供|子ども|小学生/i.test(enriched) ||
    opp?.targetSegment.some((s) => /家族|夫婦|子供/i.test(s)) === true;
  const isDualIncome = /共働き|dual/i.test(enriched);

  let persona: string[];
  let customerJobs: string[];
  let painPoints: RankedPainPoint[];
  let currentAlternatives: string[];
  let alternativeWeaknesses: string[];

  if (isExpense && isFamily) {
    persona = [
      "共働き夫婦（どちらも収入があり、支出の見える化が必要）",
      "小学生の子供がいる家庭（教育費・習い事の支出が増える）",
      "家計管理を一人で担う担当者（パートナーへの説明負担が大きい）",
    ];
    customerJobs = [
      "今月の家計を把握し、予算内に収める",
      "夫婦・家族間で支出を共有し、揉めずに清算する",
      "無駄遣いを減らし、貯蓄目標に近づく",
    ];
    painPoints = [
      {
        text: "支出の共有が面倒で、レシートや立て替えの整理が続かない",
        priority: 1,
        severity: isDualIncome ? "critical" : "high",
      },
      {
        text: "誰が何を払ったか分からず、月末の精算でストレスになる",
        priority: 2,
        severity: "high",
      },
      {
        text: "家計簿アプリが続かず、入力が一人に偏って属人化する",
        priority: 3,
        severity: "medium",
      },
    ];
    currentAlternatives = opp?.currentAlternatives ?? [
      "Excel / Google Sheets",
      "MoneyForward",
      "Zaim",
      "LINE でのやり取り",
    ];
    alternativeWeaknesses = opp?.whyExistingSolutionsFail ?? [
      "スプレッドシートはリアルタイム共有とモバイル入力に弱い",
      "大手アプリは機能が多く、家族の「今月の共有」に寄せにくい",
      "LINE だけでは集計・カテゴリ分析ができない",
    ];
  } else if (isExpense) {
    persona = [
      targetUsers.trim() || "家計を自分で管理する個人",
      "支出を可視化したいがツールが続かない層",
    ];
    customerJobs = ["毎月の支出を把握する", "節約・貯蓄のきっかけを得る"];
    painPoints = [
      {
        text: "記録が続かず、月末に何に使ったか分からない",
        priority: 1,
        severity: "high",
      },
      {
        text: "カテゴリ分けや入力の手間で習慣化しない",
        priority: 2,
        severity: "medium",
      },
    ];
    currentAlternatives = opp?.currentAlternatives ?? ["銀行アプリ", "メモ", "Excel"];
    alternativeWeaknesses = opp?.whyExistingSolutionsFail ?? [
      "銀行アプリはキャッシュ支出や共有家族向けでない",
      "手入力の摩擦が高い",
    ];
  } else {
    persona = [targetUsers.trim() || "Primary persona — validate with interviews"];
    customerJobs = ["Achieve the outcome described in the product idea"];
    painPoints = [
      {
        text: opp?.customerPain[0] ?? `Core pain from idea: ${idea.slice(0, 100)}`,
        priority: 1,
        severity: "medium",
      },
    ];
    currentAlternatives = opp?.currentAlternatives ?? ["Manual workarounds", "Incumbent tools"];
    alternativeWeaknesses = opp?.whyExistingSolutionsFail ?? [
      "Alternatives may be good enough — validate willingness to switch",
    ];
  }

  const burningNeedScore = Math.min(
    100,
    Math.max(
      25,
      painPoints.reduce((sum, p) => sum + severityToBurningWeight(p.severity), 0) +
        (discoveryMode === "guided" ? 8 : 0) +
        (input.assessment?.completenessScore ? input.assessment.completenessScore * 0.15 : 0)
    )
  );

  const personaSpecificity = Math.min(30, persona.length * 10 + (isFamily && isExpense ? 10 : 0));
  const cpfScore = Math.min(
    100,
    Math.max(
      20,
      Math.round(burningNeedScore * 0.55 + personaSpecificity + (opp?.plannerConfidence ?? 40) * 0.25)
    )
  );

  const evidenceLevel = inferEvidenceLevel(cpfScore);
  const recommendation = inferRecommendation(cpfScore, burningNeedScore);

  return {
    persona,
    customerJobs,
    painPoints,
    currentAlternatives,
    alternativeWeaknesses,
    burningNeedScore,
    cpfScore,
    evidenceLevel,
    recommendation,
  };
}

export function painPointsToInsightStrings(points: RankedPainPoint[]): string[] {
  return points.map((p) => `[P${p.priority}] ${p.text} (${p.severity})`);
}

export function burningNeedsFromReport(report: CustomerProblemFitReport): string[] {
  const top = report.painPoints[0];
  if (!top) return ["Burning need not yet scored"];
  const label =
    top.severity === "critical"
      ? "Must solve now — strong willingness to pay"
      : top.severity === "high"
        ? "Frequent frustration — high motivation to switch"
        : top.severity === "medium"
          ? "Noticeable pain — would adopt if effortless"
          : "Nice to have — weak urgency";
  return [
    `Burning need score: ${report.burningNeedScore}/100`,
    `Top pain (${top.severity}): ${top.text}`,
    label,
  ];
}
