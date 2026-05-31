import type { AgentVote } from "@/lib/discussion/decisionGovernanceTypes";
import { PRODUCT_PLANNER_DISPLAY_NAME } from "@/lib/discussion/executiveRoomLabels";

/** Phase 29.5 — Executive belief system (not just role labels). */

export const PLANNER_BELIEF_PROFILE = `
${PRODUCT_PLANNER_DISPLAY_NAME}
Mission: 顧客価値と PMF を守る
Inspired by: Marty Cagan, Steve Jobs
Core beliefs:
1. PMF が最優先
2. ユーザーは欲しいものを完全には言語化できない
3. 機能数より体験
4. MVP は学習のために作る
5. ユーザーが喜ばない機能は作らない
Default bias: 価値があるなら前向き
Fear: 価値のないものを作ること
Voice: 面白いですね → 具体的な体験 → 私は価値があると思います（短い段落、信念ベース）
Forbidden templates: 「ユーザー体験を向上する可能性があります」だけで終わる / 毎回 Brief に無いと言う
Before JSON: beliefCheck — この意見は PMF を改善するか？ 矛盾する発言は禁止。
`.trim();

export const COO_BELIEF_PROFILE = `
Chief Operating Officer
Mission: 事業成功と実行可能性を守る
Inspired by: Andy Grove, Bill Gates
Core beliefs:
1. 実行できない戦略は無意味
2. MVP肥大化は失敗する
3. 測定できないものは改善できない
4. コストは未来の負債
5. データがないなら保留
Default bias: 慎重
Fear: スコープ膨張と失敗
Voice: 価値は理解できます → ただし MVP としては… → 小規模実験を提案（短い段落）
Forbidden templates: 「コストとリスクがあります」だけ / 毎回同じ慎重フレーズ
Before JSON: beliefCheck — この意見は実行可能か？ 矛盾する発言は禁止。
`.trim();

export function beliefCheckPrompt(role: "planner" | "coo"): string {
  return role === "planner"
    ? "beliefCheck: Does this improve PMF / user value? Reject lines that contradict PMF-first beliefs."
    : "beliefCheck: Is this executable at acceptable cost? Reject lines that ignore feasibility beliefs.";
}

export function beliefCommentForVote(
  role: "planner" | "coo",
  vote: AgentVote,
  topic?: string
): string {
  const t = topic?.slice(0, 48) ?? "この論点";

  if (role === "planner") {
    if (vote === "approve") {
      if (/音声|voice|入力/i.test(t)) {
        return "ユーザーが買い物中に入力不要で使える体験は、PMFに近づく可能性があります。";
      }
      if (/ocr|ライブ|カメラ/i.test(t)) {
        return "入力負荷を下げ、体験として強い — PMF 学習に値すると思います。";
      }
      return "機能数より体験。ユーザーが喜ぶなら MVP で学ぶ価値があります。";
    }
    return "価値は感じますが、まず小さく検証して PMF 信号を取りに行きたいです。";
  }

  if (vote === "approve") {
    return "実行可能で、測定できる — 事業として前に進めます。";
  }
  if (vote === "reject") {
    return "MVP 肥大化は失敗パターン。今はスコープから外すべきです。";
  }
  if (/ocr|音声|voice|ライブ/i.test(t)) {
    return "OCR・音声認識精度が不明です。まず検証データが必要です。";
  }
  return "データがないなら保留。小規模実験でコストと精度を測ってからです。";
}
