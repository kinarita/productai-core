import type { CooReviewRecommendation } from "@/lib/coo-review/cooReviewTypes";

/** Rule-based COO recommendation — not a final business decision. */
export function inferCooReviewRecommendation(input: {
  opportunityScore: number;
  cpfScore: number;
  psfScore: number;
}): CooReviewRecommendation {
  const { opportunityScore, cpfScore, psfScore } = input;

  if (opportunityScore >= 70 && cpfScore >= 70 && psfScore >= 70) {
    return "PROCEED";
  }
  if (opportunityScore < 50 || cpfScore < 60) {
    return "HOLD";
  }
  return "VALIDATE MORE";
}
