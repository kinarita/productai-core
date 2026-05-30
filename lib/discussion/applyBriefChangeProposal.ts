import type { ProductBriefSections } from "@/lib/agents/planner/plannerTypes";
import type { CustomerProblemFitReport } from "@/lib/cpf/cpfTypes";
import type { ProblemSolutionFitReport } from "@/lib/psf/psfTypes";
import type { OpportunityBrief } from "@/lib/opportunity/opportunityTypes";
import type { BriefChangeProposal } from "@/lib/discussion/discussionTypes";

export function applyBriefChangeProposal(
  proposal: BriefChangeProposal,
  ctx: {
    brief: ProductBriefSections;
    opportunityBrief?: OpportunityBrief;
    cpfReport?: CustomerProblemFitReport;
    psfReport?: ProblemSolutionFitReport;
    psfMvpScope?: string[];
  }
): {
  brief: ProductBriefSections;
  opportunityBrief?: OpportunityBrief;
  cpfReport?: CustomerProblemFitReport;
  psfReport?: ProblemSolutionFitReport;
  psfMvpScope?: string[];
  versionLabel: string;
} {
  const brief = { ...ctx.brief, coreFeatures: [...ctx.brief.coreFeatures], risks: [...ctx.brief.risks] };
  let opportunityBrief = ctx.opportunityBrief ? { ...ctx.opportunityBrief } : undefined;
  let cpfReport = ctx.cpfReport;
  let psfReport = ctx.psfReport;
  let psfMvpScope = ctx.psfMvpScope ? [...ctx.psfMvpScope] : [];

  switch (proposal.targetSection) {
    case "mvp": {
      const chartLine = "Monthly spending chart (Should Have)";
      if (!psfMvpScope.some((s) => /chart|グラフ/i.test(s))) {
        psfMvpScope = [...psfMvpScope, `[Should Have] ${chartLine}`];
      }
      if (!brief.coreFeatures.some((f) => /chart|グラフ/i.test(f))) {
        brief.coreFeatures.push(chartLine);
      }
      if (psfReport) {
        psfReport = {
          ...psfReport,
          mvpFeatures: {
            ...psfReport.mvpFeatures,
            shouldHave: [...psfReport.mvpFeatures.shouldHave, chartLine],
          },
        };
      }
      return {
        brief,
        opportunityBrief,
        cpfReport,
        psfReport,
        psfMvpScope,
        versionLabel: proposal.title.slice(0, 48),
      };
    }
    case "cpf": {
      brief.targetUsers = proposal.after.includes("\n")
        ? proposal.after.split("\n").slice(-1)[0]!.replace(/^\[Refinement\]\s*/i, "").trim()
        : proposal.after;
      if (cpfReport) {
        cpfReport = {
          ...cpfReport,
          persona: [...cpfReport.persona, proposal.after.slice(0, 120)],
        };
      }
      return {
        brief,
        opportunityBrief,
        cpfReport,
        psfReport,
        psfMvpScope,
        versionLabel: "Refined target audience",
      };
    }
    case "brief": {
      if (!brief.risks.some((r) => /diary study|検証/i.test(r))) {
        brief.risks.push("Pre-launch: 5-user diary study before architecture");
      }
      brief.recommendedNextStep = `${brief.recommendedNextStep}\n${proposal.after.slice(0, 120)}`.trim();
      return {
        brief,
        opportunityBrief,
        cpfReport,
        psfReport,
        psfMvpScope,
        versionLabel: "Risk mitigation update",
      };
    }
    case "opportunity": {
      if (opportunityBrief) {
        opportunityBrief = {
          ...opportunityBrief,
          opportunitySummary: `${opportunityBrief.opportunitySummary}\n\n${proposal.after.slice(0, 200)}`,
        };
      }
      return {
        brief,
        opportunityBrief,
        cpfReport,
        psfReport,
        psfMvpScope,
        versionLabel: "Opportunity refinement",
      };
    }
    case "psf": {
      if (psfReport) {
        psfReport = {
          ...psfReport,
          solutionHypothesis: `${psfReport.solutionHypothesis}\n\n${proposal.after.slice(0, 200)}`,
        };
      }
      return {
        brief,
        opportunityBrief,
        cpfReport,
        psfReport,
        psfMvpScope,
        versionLabel: "PSF update",
      };
    }
    default:
      return {
        brief,
        opportunityBrief,
        cpfReport,
        psfReport,
        psfMvpScope,
        versionLabel: proposal.title.slice(0, 48),
      };
  }
}
