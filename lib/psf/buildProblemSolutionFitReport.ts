import type { CustomerProblemFitReport } from "@/lib/cpf/cpfTypes";
import type { OpportunityBrief } from "@/lib/opportunity/opportunityTypes";
import type { PlannerClarificationAssessment } from "@/lib/agents/planner/plannerClarification";
import type { ProjectCreationInput } from "@/lib/project-creation/projectCreationTypes";
import type {
  MvpFeatureScope,
  ProblemSolutionFitReport,
  PsfConfidenceLevel,
  PsfRecommendation,
} from "@/lib/psf/psfTypes";

function inferConfidence(psfScore: number): PsfConfidenceLevel {
  if (psfScore >= 72) return "high";
  if (psfScore >= 48) return "medium";
  return "low";
}

function inferRecommendation(psfScore: number): PsfRecommendation {
  if (psfScore >= 68) return "proceed";
  if (psfScore >= 42) return "validate_more";
  return "hold";
}

/** Rule-based PSF report — after CPF (Phase 20). */
export function buildProblemSolutionFitReport(input: {
  projectName: string;
  creation: ProjectCreationInput;
  cpfReport?: CustomerProblemFitReport;
  opportunityBrief?: OpportunityBrief;
  assessment?: PlannerClarificationAssessment;
}): ProblemSolutionFitReport {
  const enriched = `${input.creation.idea}\n${input.creation.targetUsers}\n${input.creation.clarifications ?? ""}`;
  const isExpense = /家計|expense|budget|ledger|支出|家計簿/i.test(enriched);
  const isFamily =
    /家族|family|夫婦|共働き|household|子供|子ども/i.test(enriched) ||
    (input.cpfReport?.persona.some((p) => /家族|夫婦|子供/i.test(p)) ?? false);

  const topPain =
    input.cpfReport?.painPoints.find((p) => p.priority === 1) ??
    input.cpfReport?.painPoints[0];
  const topProblem =
    topPain?.text ?? "Core customer problem needs validation with real users";

  let solutionHypothesis: string;
  let expectedOutcome: string;
  let validationAssumptions: string[];
  let validationRisks: string[];
  let validationPlan: string[];
  let mvpFeatures: MvpFeatureScope;

  if (isExpense && isFamily) {
    solutionHypothesis =
      "共有家計簿として支出入力を家族で共有し、全員がリアルタイムで家計状況を把握できるようにする";
    expectedOutcome =
      "月末の立て替え精算時間が減り、誰が何にいくら使ったかを説明するストレスが下がる";
    validationAssumptions = [
      "家族の主要メンバーが週1回以上入力する",
      "共有ビューがあれば継続利用する",
      "スプレッドシートより入力が楽だと感じる",
    ];
    validationRisks = [
      "入力が面倒で一人だけが記録し続ける",
      "LINEや口頭のやり取りで『十分』と感じる",
      "既存アプリ（MoneyForward / Zaim）の共有機能で満足する",
    ];
    validationPlan = [
      "ターゲット5世帯へのヒアリング（現状の精算フロー）",
      "クリック可能プロトタイプで共有フローをテスト",
      "ランディングページで事前登録の反応を見る",
    ];
    mvpFeatures = {
      mustHave: ["支出入力（金額・カテゴリ・支払者）", "家族メンバーとの共有ビュー"],
      shouldHave: ["月次サマリー・カテゴリ別集計"],
      couldHave: ["支出リマインダー通知"],
      wontHave: ["AI家計分析", "銀行口座連携", "投資ポートフォリオ"],
    };
  } else if (isExpense) {
    solutionHypothesis =
      "最小入力で支出を記録し、週次で振り返れるシンプルな家計ツールを提供する";
    expectedOutcome = "月末に『何に使ったか』を把握でき、節約のきっかけが得られる";
    validationAssumptions = [
      "ユーザーが週2回以上記録を続けられる",
      "カテゴリ自動提案で入力摩擦が下がる",
    ];
    validationRisks = [
      "銀行アプリの支出一覧で十分と感じる",
      "習慣化前にアプリを削除する",
    ];
    validationPlan = [
      "個人ユーザー5名へのインタビュー",
      "2週間の手動記録テスト（紙 vs アプリモック）",
    ];
    mvpFeatures = {
      mustHave: ["支出のクイック入力", "今月の支出一覧"],
      shouldHave: ["カテゴリ別グラフ"],
      couldHave: ["予算アラート"],
      wontHave: ["家族共有", "銀行連携", "AI予測"],
    };
  } else {
    solutionHypothesis = `Focused MVP that addresses: ${topProblem.slice(0, 120)}`;
    expectedOutcome =
      input.creation.successGoal.trim() || "Measurable improvement for target users within 90 days";
    validationAssumptions = [
      "Target users will adopt the proposed workflow",
      "The solution is simpler than current workarounds",
    ];
    validationRisks = [
      "Incumbent tools are good enough",
      "Problem frequency is too low to drive habit",
    ];
    validationPlan = [
      "5 customer discovery interviews",
      "Prototype test with 3–5 users",
    ];
    mvpFeatures = {
      mustHave: ["Core workflow from the product idea"],
      shouldHave: ["Reporting or status view"],
      couldHave: ["Notifications"],
      wontHave: ["Enterprise admin", "Advanced analytics"],
    };
  }

  const cpfScore = input.cpfReport?.cpfScore ?? 45;
  const burningNeed = input.cpfReport?.burningNeedScore ?? 40;
  const mvpClarity = mvpFeatures.mustHave.length >= 2 ? 12 : 4;
  const riskPenalty = Math.min(15, validationRisks.length * 4);

  let psfScore = Math.min(
    100,
    Math.max(
      25,
      Math.round(cpfScore * 0.35 + burningNeed * 0.25 + mvpClarity + 20 - riskPenalty)
    )
  );
  if (input.creation.discoveryMode === "guided") {
    psfScore = Math.min(100, psfScore + 5);
  }
  if (input.opportunityBrief?.recommendedAction === "proceed") {
    psfScore = Math.min(100, psfScore + 4);
  }

  const confidenceLevel = inferConfidence(psfScore);
  const recommendation = inferRecommendation(psfScore);

  return {
    topProblem,
    solutionHypothesis,
    expectedOutcome,
    validationAssumptions,
    validationRisks,
    validationPlan,
    mvpFeatures,
    psfScore,
    confidenceLevel,
    recommendation,
  };
}

export function mvpScopeToInsightStrings(scope: MvpFeatureScope): string[] {
  return [
    `Must: ${scope.mustHave.join("; ")}`,
    `Should: ${scope.shouldHave.join("; ")}`,
    `Could: ${scope.couldHave.join("; ")}`,
    `Won't: ${scope.wontHave.join("; ")}`,
  ];
}
