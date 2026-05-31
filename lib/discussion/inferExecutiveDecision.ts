import type { DiscussionMessage } from "@/lib/discussion/discussionTypes";
import type { ExecutiveDecisionMark } from "@/lib/discussion/strategyRoomTypes";

export function inferExecutiveDecisionFromCeoMessage(
  message: string,
  priorMessages: DiscussionMessage[]
): { statement: string; status: ExecutiveDecisionMark } | null {
  const trimmed = message.trim();
  if (!trimmed) return null;

  if (/^(I agree|同意|賛成|それで進め|合意|了解|OKです|ok\.?$)/i.test(trimmed)) {
    const lastPlanner = [...priorMessages].reverse().find((m) => m.participant === "planner");
    const lastCoo = [...priorMessages].reverse().find((m) => m.participant === "coo");
    const topic =
      lastPlanner?.summary?.slice(0, 120) ??
      lastPlanner?.message?.slice(0, 120) ??
      lastCoo?.summary?.slice(0, 120) ??
      "Prior discussion direction";
    const statement = topic.replace(/\*\*/g, "").split("\n")[0]?.trim() || topic;
    return { statement, status: "agreed" };
  }

  if (/却下|reject|やめ|見送|not pursuing|しない/i.test(trimmed)) {
    return { statement: trimmed.slice(0, 200), status: "rejected" };
  }

  if (/\?$|？$|どうすべき|検討|unclear|open/i.test(trimmed) && trimmed.length < 120) {
    return { statement: trimmed, status: "open_question" };
  }

  return null;
}
