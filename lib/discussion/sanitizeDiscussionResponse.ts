const BANNED_PATTERNS: RegExp[] = [
  /3点を整理しましょう/i,
  /市場機会とリスクの観点で/i,
  /ご質問を受け取りました/i,
  /仮説・ユーザー価値・検証方法の3点/i,
  /プロダクト設計の観点では、仮説/i,
];

export function sanitizeDiscussionResponse(text: string, productName: string): string {
  let out = text.trim();
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(out)) {
      out = out.replace(pattern, "").trim();
    }
  }
  if (out.length < 40) {
    return `「${productName}」について、Brief と Discovery の内容を踏まえて検討が必要です。具体的な仮説を1つ挙げてください。`;
  }
  return out;
}
