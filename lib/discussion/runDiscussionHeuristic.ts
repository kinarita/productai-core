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
import type { DiscussionMode } from "@/lib/discussion/strategyRoomTypes";

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
  thread: boolean,
  mode: DiscussionMode
) {
  const mustHave = mvp.slice(0, 2).join("、") || brief?.coreFeatures?.slice(0, 2).join("、");
  if (mode === "decision") {
    const summary = `**結論:** 月次グラフは **MVPに含める** 方向で推奨します。\n\n**理由:** 「${name}」の価値は支出の見える化で、入力が続いたユーザーにはグラフが習慣化の報酬になります。\n\n**質問:** 週次サマリー＋月次グラフの2段階で合意しますか？`;
    return {
      summary,
      detail: `### 決定モード\n- Must Have 維持: ${mustHave}\n- 検証: 3週間で入力3回以上ユーザーのグラフ開封率`,
    };
  }
  if (mode === "challenge") {
    const summary = `**結論:** 「グラフ必須」という前提を疑うべきです。\n\n**理由:** Must Have は「${mustHave}」で既に厚い。グラフは検証前の仮説に過ぎません。\n\n**質問:** グラフなしで5ユーザーに2週間使ってもらえますか？`;
    return {
      summary,
      detail: `### 前提へのチャレンジ\n- 見える化＝価値 とは限らない\n- PSF Should-have: ${psf?.mvpFeatures.shouldHave.join("、") || "未定"}`,
    };
  }
  const summary = thread
    ? `**結論:** 先ほどのグラフの話なら、トップは軽いサマリーだけで十分です。\n\n**理由:** 「${name}」はまず入力習慣が価値の核で、Must Have は「${mustHave}」に集中すべきです。\n\n**質問:** 月次グラフだけを Should Have に置く案で進めますか？`
    : `**結論:** MVPではグラフは **Should Have** に回すべきです。\n\n**理由:** 「${name}」は見える化より先に記録が続くことが重要で、入力がなければグラフは空になります。\n\n**質問:** 週3回入力したユーザーだけβチャートを開く検証でよいですか？`;

  const detail = `### プロダクト観点（詳細）\n- 現行 Must Have: ${mustHave || "未定義"}\n- PSF Should-have: ${psf?.mvpFeatures.shouldHave.join("、") || "未定"}`;

  return { summary, detail };
}

function buildCooCharts(
  name: string,
  opp: DiscussionContextInput["opportunityBrief"],
  thread: boolean,
  mode: DiscussionMode
) {
  const alt = opp?.currentAlternatives?.[0] ?? "主要家計簿アプリ";
  if (mode === "decision") {
    const summary = `**結論:** グラフは **段階導入** で合意可能です（Must Have 化は慎重に）。\n\n**理由:** ${alt} との差別化は入力体験側。グラフは第2スプリントでも遅れません。\n\n**質問:** 入力KPI達成後にグラフを解禁する条件を決めますか？`;
    return { summary, detail: `### 事業合意\n- 実行リスクを抑えつつ見える化ロードマップを明示` };
  }
  if (mode === "challenge" || mode === "explore") {
    const summary =
      mode === "challenge"
        ? `**結論:** Plannerと異なり、グラフの **Must Have 化には反対** です。\n\n**理由:** 開発・保守コストが高く、「${name}」は ${alt} とグラフ競争で不利です。入力の継続が先です。\n\n**質問:** グラフを第2フェーズに回し、今は獲得と継続に集中しますか？`
        : thread
          ? `**結論:** サマリー表示はコスト低めで、フルグラフの Must Have 化は避けたいです。\n\n**理由:** 「${name}」が ${alt} と同じ土俵でグラフ競争すると差別化が薄れます。\n\n**質問:** 継続率KPIを先に置き、グラフは第2フェーズにしますか？`
          : `**結論:** グラフは **Should Have** で十分です。\n\n**理由:** 競合は標準装備ですが、${alt} でも継続率は入力体験に依存します。\n\n**質問:** MVP投資を入力に寄せる方針で合意しますか？`;
    return {
      summary,
      detail: `### 事業観点（COOはPlannerと必ずしも一致しない）\n- 実行コストと競合ベンチマークを優先`,
    };
  }
  const summary = thread
    ? `**結論:** サマリー表示はコスト低めで、フルグラフの Must Have 化は避けたいです。\n\n**理由:** 「${name}」が ${alt} と同じ土俵でグラフ競争すると差別化が薄れます。\n\n**質問:** 継続率KPIを先に置き、グラフは第2フェーズにしますか？`
    : `**結論:** グラフは **Should Have** で十分です。\n\n**理由:** 競合は標準装備ですが、${alt} でも継続率は入力体験に依存します。\n\n**質問:** MVP投資を入力に寄せる方針で合意しますか？`;

  return { summary, detail: `### 事業観点\n- 実装コスト対効果` };
}

export function runDiscussionHeuristic(
  input: DiscussionContextInput & { userMessage: string; discussionMode?: DiscussionMode }
): {
  plannerResponse: string;
  plannerSummary: string;
  plannerDetail: string;
  cooResponse: string;
  cooSummary: string;
  cooDetail: string;
  suggestedChanges: BriefChangeProposal[];
  relatedSection: DiscussionRelatedSection;
  plannerChallenged?: boolean;
  cooRaisedConcern?: boolean;
} {
  const ctx = buildDiscussionContext(input);
  const mode = input.discussionMode ?? "explore";
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
    const p = buildPlannerCharts(name, brief, mvp, psf, thread, mode);
    const c = buildCooCharts(name, input.opportunityBrief, thread, mode);
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

  const plannerChallenged = mode === "challenge" && /前提|疑う|challenge/i.test(plannerSummary);
  const cooRaisedConcern = /反対|risk|懸念|コスト|競合/i.test(cooSummary);

  return {
    plannerResponse: plannerSummary,
    plannerSummary,
    plannerDetail,
    cooResponse: cooSummary,
    cooSummary,
    cooDetail,
    suggestedChanges,
    relatedSection,
    plannerChallenged,
    cooRaisedConcern,
  };
}
