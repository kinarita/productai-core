import type { PlannerClarificationAssessment } from "@/lib/agents/planner/plannerClarification";
import type { ProjectCreationInput } from "@/lib/project-creation/projectCreationTypes";
import type {
  EvidenceLevel,
  OpportunityBrief,
  RecommendedAction,
} from "@/lib/opportunity/opportunityTypes";

function inferEvidenceLevel(confidence: number): EvidenceLevel {
  if (confidence >= 72) return "high";
  if (confidence >= 48) return "medium";
  return "low";
}

function inferRecommendedAction(confidence: number): RecommendedAction {
  if (confidence >= 68) return "proceed";
  if (confidence >= 42) return "needs_validation";
  return "hold";
}

/** Rule-based Opportunity Brief — no market research APIs (Phase 18). */
export function buildOpportunityBriefFromInput(input: {
  projectName: string;
  creation: ProjectCreationInput;
  assessment?: PlannerClarificationAssessment;
}): OpportunityBrief {
  const { idea, targetUsers, successGoal, clarifications } = input.creation;
  const enriched = `${idea}\n${targetUsers}\n${successGoal}\n${clarifications ?? ""}`;
  const isExpense = /家計|expense|budget|ledger|支出|家計簿/i.test(enriched);
  const isFamily = /家族|family|夫婦|共働き|household|子供|子ども/i.test(enriched);
  const isStudent = /学生|student/i.test(enriched);

  const completeness = input.assessment?.completenessScore ?? 55;
  const gapCount = input.assessment?.gaps.length ?? 2;
  const strengthCount = input.assessment?.strengths.length ?? 1;
  const cpfScore = input.assessment?.pmfReadiness.cpf ?? 40;

  let plannerConfidence = Math.min(
    100,
    Math.max(
      28,
      completeness - gapCount * 5 + strengthCount * 6 + (isExpense && isFamily ? 12 : 0)
    )
  );
  if (input.creation.discoveryMode === "guided") {
    plannerConfidence = Math.min(100, plannerConfidence + 6);
  }

  const evidenceLevel = inferEvidenceLevel(plannerConfidence);
  const recommendedAction = inferRecommendedAction(plannerConfidence);

  if (isExpense) {
    const targetSegment = isFamily
      ? ["共働き夫婦", "小学生の子供がいる家庭", "支出を共有したい家族"]
      : isStudent
        ? ["予算管理が初めての学生", "アルバイト収入を記録したい若年層"]
        : [targetUsers.trim() || "家計を自分で管理する個人"];

    const customerPain = isFamily
      ? [
          "支出の記録・共有が面倒で、誰が何を払ったか見えにくい",
          "家計管理が一人に偏り、属人化している",
          "既存アプリは機能が多く、日常の「さっと記録」に向かない",
        ]
      : [
          "支出を続けられず、月末に何に使ったか振り返れない",
          "カテゴリ分けや入力の手間で習慣化しない",
          "目標（貯蓄・節約）と日々の行動がつながらない",
        ];

    const currentAlternatives = isFamily
      ? ["Excel / Google スプレッドシート", "MoneyForward", "Zaim", "紙の家計簿・メモ"]
      : ["スマホメモ", "銀行アプリの支出一覧", "MoneyForward / Zaim", "Excel"];

    const whyExistingSolutionsFail = [
      "スプレッドシートは共有・リアルタイム性が弱く、続かない",
      "大手家計アプリは機能過多で、家族の「今月の共有支出」にフォーカスしにくい",
      "入力の手間が残り、共同利用のルールがチームに定着しない",
    ];

    const opportunityHypothesis = isFamily
      ? "共働き・子育て世帯では「誰が・何に・いくら」を短時間で揃えたいニーズが残っており、共有ファーストの軽量プロダクトに参入余地がある。"
      : "シンプルな記録と振り返りに特化すれば、多機能アプリに疲れた層を取り込める可能性がある。";

    return {
      opportunitySummary: `「${input.projectName}」は、${targetSegment[0]}向けに家計・支出の見える化と習慣化を支援する市場機会です。成功指標: ${successGoal}`,
      targetSegment,
      customerPain,
      currentAlternatives,
      whyExistingSolutionsFail,
      opportunityHypothesis,
      evidenceLevel,
      plannerConfidence,
      recommendedAction,
    };
  }

  return {
    opportunitySummary: `「${input.projectName}」向けの機会: ${idea.slice(0, 200)}`,
    targetSegment: [targetUsers.trim() || "Primary segment to validate"],
    customerPain: [
      `Core pain implied by the idea: ${idea.slice(0, 120)}`,
      "Current workarounds are unclear — validate with 3–5 user interviews",
    ],
    currentAlternatives: ["Manual workarounds", "Generic spreadsheets", "Incumbent apps in the category"],
    whyExistingSolutionsFail: [
      "Incumbents may be too complex or misaligned with this segment's daily workflow",
      "Switching cost and habit inertia keep users on suboptimal tools",
    ],
    opportunityHypothesis:
      "If the problem is frequent and painful enough, a focused MVP can win on simplicity before incumbents adapt.",
    evidenceLevel,
    plannerConfidence,
    recommendedAction,
  };
}
