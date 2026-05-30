import type { DiscussionContext } from "@/lib/discussion/buildDiscussionContext";
import {
  buildDiscussionContext,
  inferRelatedSectionFromMessage,
  type DiscussionContextInput,
} from "@/lib/discussion/buildDiscussionContext";
import type {
  BriefChangeProposal,
  DiscussionRelatedSection,
} from "@/lib/discussion/discussionTypes";

function proposalId(): string {
  return `prop-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function continuesPriorThread(message: string, ctx: DiscussionContext): boolean {
  return (
    /先ほど|さっき|じゃあ|それなら|トップ|画面|続けて/i.test(message) &&
    ctx.priorTopics.length > 0
  );
}

function detectFocus(message: string): string {
  if (/グラフ|chart|graph|可視化/i.test(message)) return "charts";
  if (/ターゲット|audience|ユーザー.*広|ペルソナ/i.test(message)) return "audience";
  if (/競合|competitor|zaim|moneyforward/i.test(message)) return "competitors";
  if (/モバイル|mobile|web|アプリ.*先/i.test(message)) return "platform";
  if (/mvp|スコープ|機能/i.test(message)) return "mvp";
  if (/リスク|失敗/i.test(message)) return "risk";
  return "general";
}

function buildPlannerCharts(
  name: string,
  brief: DiscussionContextInput["brief"],
  mvp: string[],
  psf: DiscussionContextInput["psfReport"],
  thread: boolean
) {
  const mustHave = mvp.slice(0, 2).join("、") || brief?.coreFeatures?.slice(0, 2).join("、");
  const summary = thread
    ? `**結論:** 先ほどのグラフの話なら、トップは軽いサマリーだけで十分です。\n\n**理由:** 「${name}」はまず入力習慣が価値の核で、Must Have は「${mustHave}」に集中すべきです。\n\n**質問:** 月次グラフだけを Should Have に置く案で進めますか？`
    : `**結論:** MVPではグラフは **Should Have** に回すべきです。\n\n**理由:** 「${name}」は見える化より先に記録が続くことが重要で、入力がなければグラフは空になります。\n\n**質問:** 週3回入力したユーザーだけβチャートを開く検証でよいですか？`;

  const detail = `### プロダクト観点（詳細）\n- 現行 Must Have: ${mustHave || "未定義"}\n- PSF Should-have: ${psf?.mvpFeatures.shouldHave.join("、") || "未定"}\n- フルダッシュボードは **Out of Scope** 相当まで遅らせ、データが溜まってから可視化する方が学習コストが低いです。`;

  return { summary, detail };
}

function buildCooCharts(name: string, opp: DiscussionContextInput["opportunityBrief"], thread: boolean) {
  const alt = opp?.currentAlternatives?.[0] ?? "主要家計簿アプリ";
  const summary = thread
    ? `**結論:** サマリー表示はコスト低めで、フルグラフの Must Have 化は避けたいです。\n\n**理由:** 「${name}」が ${alt} と同じ土俵でグラフ競争すると差別化が薄れます。\n\n**質問:** 継続率KPIを先に置き、グラフは第2フェーズにしますか？`
    : `**結論:** グラフは **Should Have** で十分です。\n\n**理由:** 競合は標準装備ですが、${alt} でも継続率は入力体験に依存します。\n\n**質問:** MVP投資を入力に寄せる方針で合意しますか？`;

  const detail = `### 事業観点（詳細）\n- 実装コスト対効果: グラフは開発・保守コストが高め\n- 収益化前はニッチな「記録が続く」体験の方が戦略的フィットが上がります`;

  return { summary, detail };
}

export function runDiscussionHeuristic(
  input: DiscussionContextInput & { userMessage: string }
): {
  plannerResponse: string;
  plannerSummary: string;
  plannerDetail: string;
  cooResponse: string;
  cooSummary: string;
  cooDetail: string;
  suggestedChanges: BriefChangeProposal[];
  relatedSection: DiscussionRelatedSection;
} {
  const ctx = buildDiscussionContext(input);
  const focus = detectFocus(input.userMessage);
  const relatedSection = inferRelatedSectionFromMessage(input.userMessage);
  const name = ctx.projectName;
  const brief = input.brief;
  const cpf = input.cpfReport;
  const psf = input.psfReport;
  const mvp = input.psfMvpScope ?? psf?.mvpFeatures.mustHave ?? [];
  const thread = continuesPriorThread(input.userMessage, ctx);

  let plannerSummary = "";
  let plannerDetail = "";
  let cooSummary = "";
  let cooDetail = "";

  if (focus === "charts" || (thread && ctx.priorTopics.includes("charts"))) {
    const p = buildPlannerCharts(name, brief, mvp, psf, thread);
    const c = buildCooCharts(name, input.opportunityBrief, thread);
    plannerSummary = p.summary;
    plannerDetail = p.detail;
    cooSummary = c.summary;
    cooDetail = c.detail;
  } else if (focus === "audience") {
    const persona = cpf?.persona?.[0] ?? brief?.targetUsers?.slice(0, 60) ?? "未定義";
    plannerSummary = `**結論:** ターゲットは「${persona}」に絞るべきです。\n\n**理由:** CPF ${cpf?.cpfScore ?? "—"}% 時点で Brief の「${brief?.targetUsers?.slice(0, 80) ?? "—"}」は広めです。\n\n**質問:** 共働き世帯・週1家計見直しに限定しますか？`;
    plannerDetail = `### CPF\n- 上位ペイン: ${cpf?.painPoints?.[0]?.text ?? "—"}\n- コア機能: ${brief?.coreFeatures?.[0] ?? "—"}`;
    cooSummary = `**結論:** セグメントを1つに絞るとCACが下がります。\n\n**理由:** 「${name}」が万人向けになるとメッセージがぼやけます。\n\n**質問:** 支払い意思の高いニッチに絞りますか？`;
    cooDetail = `### 市場\n- 懸念: ${input.cooReview?.concerns?.[0] ?? "ターゲット未定"}`;
  } else if (focus === "platform") {
    const mustHave = psf?.mvpFeatures.mustHave.join("、") ?? "";
    plannerSummary = `**結論:** モバイル先が妥当です。\n\n**理由:** 「${name}」のジョブは隙間時間の入力で、Must Have「${mustHave.slice(0, 60)}」はモバイル前提です。\n\n**質問:** 4週間モバイルのみでリテンションを見ますか？`;
    plannerDetail = `### PSF\n- Top problem: ${psf?.topProblem ?? "—"}\n- Recommendation: ${psf?.recommendation ?? "—"}`;
    cooSummary = `**結論:** モバイルファーストは獲得に有利です。\n\n**理由:** 単一プラットフォームの方が実行リスクが下がります。\n\n**質問:** Web管理画面は第2フェーズでよいですか？`;
    cooDetail = `### 実行\n- 開発リソースは1.5倍想定`;
  } else {
    plannerSummary = `**結論:** 次は「${brief?.recommendedNextStep?.slice(0, 80) ?? "検証"}」が優先です。\n\n**理由:** 「${name}」の成功指標は「${brief?.successMetrics ?? input.successGoal}」です。\n\n**質問:** 今週どの仮説を5ユーザーで潰しますか？`;
    plannerDetail = `### Brief\n${brief?.projectSummary?.slice(0, 200) ?? "—"}`;
    cooSummary = `**結論:** 議論で合意した変更だけ Brief に反映しましょう。\n\n**理由:** COO推奨は ${input.cooReview?.recommendation ?? "—"} です。\n\n**質問:** 承認前に他に懸念はありますか？`;
    cooDetail = `### COO\n${input.cooReview?.executiveSummary?.slice(0, 240) ?? "—"}`;
  }

  const suggestedChanges: BriefChangeProposal[] = [];
  const now = new Date().toISOString();

  if (focus === "charts") {
    const before = mvp.join("\n") || brief?.coreFeatures.join("\n") || "";
    suggestedChanges.push({
      id: proposalId(),
      title: "Mark monthly chart as Should Have in MVP",
      description: "Reflect discussion: chart deferred from Must Have.",
      reason: "CEO asked about charts; Planner and COO agreed input habit comes first.",
      impact: "Reduces MVP scope creep while documenting chart intent.",
      affectedSections: ["mvp", "brief"],
      targetSection: "mvp",
      before: before.slice(0, 400),
      after: `${before}\n[Should Have] Monthly spending chart after 3+ weekly inputs`,
      confidence: 76,
      status: "pending",
      proposedAt: now,
    });
  }

  if (focus === "audience" && brief?.targetUsers) {
    suggestedChanges.push({
      id: proposalId(),
      title: "Sharpen primary persona in target users",
      description: "Narrow CPF/Brief alignment from audience discussion.",
      reason: "CEO flagged audience may be too broad.",
      impact: "Clearer messaging and MVP focus for " + name,
      affectedSections: ["cpf", "brief"],
      targetSection: "cpf",
      before: brief.targetUsers.slice(0, 300),
      after: `${brief.targetUsers}\n[Primary persona] Couples reviewing shared expenses weekly.`,
      confidence: 68,
      status: "pending",
      proposedAt: now,
    });
  }

  return {
    plannerResponse: plannerSummary,
    plannerSummary,
    plannerDetail,
    cooResponse: cooSummary,
    cooSummary,
    cooDetail,
    suggestedChanges,
    relatedSection,
  };
}
