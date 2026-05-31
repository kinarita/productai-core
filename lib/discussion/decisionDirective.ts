/** Phase 28.5.1 — CEO directives that require Decision Candidate (Stage 2). */

const JA_DECISION =
  /入れてください|入れたい|入れましょう|追加してください|追加したい|追加しましょう|反映してください|反映したい|反映しましょう|ブリーフに入れ|ブリーフに含め|ブリーフに反映|プロダクトブリーフに|含めてください|含めたい|含めましょう|MVPに入れ|MVPに含め|採用してください|採用したい|採用します|採用しよう|この方向で進め|これで進め|進めてください|進めましょう|決めましょう|決めよう|決めたい|決定します|却下しよう|却下したい|承認したい/i;

const EN_DECISION_PATTERN =
  /\badd\s+it\b|\binclude\s+it\b|\badd\s+this\b|\binclude\s+this\b|add this to the brief|include this in the brief|add this to mvp|include this in mvp|adopt this|approve this|proceed with this|let's proceed|let's decide|make this part of the plan/i;

/** CEO clearly requests inclusion / approval — Stage 2, not Discussion Signal only. */
export function isCeoDecisionDirective(message: string): boolean {
  const m = message.trim();
  if (!m) return false;
  if (JA_DECISION.test(m)) return true;
  if (EN_DECISION_PATTERN.test(m)) return true;
  return false;
}

/** Exploratory phrasing — Stage 1 only (no Candidate yet). */
export function isCeoBrainstormPhrase(message: string): boolean {
  if (isCeoDecisionDirective(message)) return false;
  const m = message.trim();
  return (
    /どう[？?]?$|どう思う|どうかな|ありかな|できないかな|もあり[？?]?$/i.test(m) ||
    /面白いね|面白いかも|いいね[！!]?$|いいかも/i.test(m) ||
    /what about|could we|maybe we should/i.test(m)
  );
}
