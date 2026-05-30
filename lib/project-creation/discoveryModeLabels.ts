import type { DiscoveryMode } from "@/lib/project-creation/projectCreationTypes";

export const discoveryModeLabels: Record<
  DiscoveryMode,
  { title: string; description: string }
> = {
  quick: {
    title: "まず形にする",
    description: "3〜5分。AIが仮説を立てて、少ない質問で企画案を作ります。",
  },
  guided: {
    title: "しっかり考える",
    description: "10〜30分。顧客・課題・MVP・PMFまで深掘りします。",
  },
};

export const discoveryModeSectionLabel = "はじめ方";

/** Rule-based recommendation — no LLM (Phase 17 UX). */
export function recommendDiscoveryMode(idea: string): DiscoveryMode {
  return idea.trim().length >= 80 ? "guided" : "quick";
}

export function discoveryModeRecommendationCopy(idea: string): {
  recommended: DiscoveryMode;
  headline: string;
  body: string;
} {
  const recommended = recommendDiscoveryMode(idea);
  if (recommended === "quick") {
    return {
      recommended,
      headline: "AIおすすめ：まず形にする",
      body: "まだアイデア段階の場合は、まず方向性を固めるのがおすすめです。",
    };
  }
  return {
    recommended,
    headline: "AIおすすめ：しっかり考える",
    body: "アイデアが十分に書かれているので、深掘りして価値を確認するのがおすすめです。",
  };
}

export function discoveryModeDisplayTitle(mode: DiscoveryMode): string {
  return discoveryModeLabels[mode].title;
}
