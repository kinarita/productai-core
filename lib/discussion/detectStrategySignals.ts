import type { StrategySignal, StrategySignalKind } from "@/lib/discussion/strategyRoomTypes";

function signalId(): string {
  return `sig-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
}

function alreadyHas(
  existing: StrategySignal[],
  kind: StrategySignalKind,
  title: string
): boolean {
  return existing.some((s) => s.kind === kind && s.title === title);
}

export function detectStrategySignals(input: {
  ceoMessage: string;
  plannerSummary?: string;
  cooSummary?: string;
  existing?: StrategySignal[];
  sourceMessageId?: string;
}): StrategySignal[] {
  const existing = input.existing ?? [];
  const text = [input.ceoMessage, input.plannerSummary, input.cooSummary]
    .filter(Boolean)
    .join("\n");
  const now = new Date().toISOString();
  const found: StrategySignal[] = [];

  const add = (kind: StrategySignalKind, title: string, description: string) => {
    if (alreadyHas([...existing, ...found], kind, title)) return;
    found.push({
      id: signalId(),
      kind,
      title,
      description,
      sourceMessageId: input.sourceMessageId,
      createdAt: now,
    });
  };

  if (/広|too broad|セグメント|ターゲット.*絞|スコープ|scope creep|mvp.*大/i.test(text)) {
    add(
      "scope_risk",
      "MVP scope may be expanding",
      "Discussion flagged target or MVP scope breadth — validate Must Have boundaries."
    );
  }

  if (/インサイト|persona|ペルソナ|顧客理解|pain|ペイン|ジョブ/i.test(text)) {
    add(
      "user_insight",
      "New customer insight surfaced",
      "Conversation revealed persona, jobs, or pain points worth capturing in Brief."
    );
  }

  if (/競合|収益|revenue|monetiz|失敗|risk|コスト|CAC/i.test(text)) {
    add(
      "business_risk",
      "Business or competition risk noted",
      "COO or CEO raised market, revenue, or execution concerns."
    );
  }

  if (/ニッチ|機会|opportunity|差別化|未開拓|新市場/i.test(text)) {
    add(
      "new_opportunity",
      "Market opportunity discovered",
      "Discussion identified a positioning or segment opportunity."
    );
  }

  return found;
}
