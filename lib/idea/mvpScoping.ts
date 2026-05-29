import type { ProductIdea } from "@/lib/idea/ideaWorkspace";

export interface MvpScope {
  mustHave: string[];
  shouldHave: string[];
  couldHave: string[];
  outOfScope: string[];
}

export function buildMvpScope(idea: ProductIdea): MvpScope {
  const base = idea.title;

  if (idea.tags.includes("enterprise")) {
    return {
      mustHave: ["Enterprise SSO", "Self-service billing overview", "Role-based access"],
      shouldHave: ["Support ticket integration", "Admin audit trail"],
      couldHave: ["Advanced analytics widgets"],
      outOfScope: ["Consumer marketplace features", "Full white-label branding"],
    };
  }

  if (idea.tags.includes("analytics")) {
    return {
      mustHave: ["Real-time ingestion path", "CEO dashboard freshness under 5s"],
      shouldHave: ["Tenant partitioning option analysis"],
      couldHave: ["50K/sec scale headroom documentation"],
      outOfScope: ["Custom infra over managed services preference breach"],
    };
  }

  if (idea.tags.includes("mobile")) {
    return {
      mustHave: ["Onboarding flow v2", "Device matrix QA coverage"],
      shouldHave: ["Push notification hooks"],
      couldHave: ["Personalization experiments"],
      outOfScope: ["Desktop-only admin redesign"],
    };
  }

  return {
    mustHave: [`Core value delivery for ${base}`, "Executive-readable mission summary"],
    shouldHave: ["Integration with existing ProductAI workspaces"],
    couldHave: ["Extended feature candidates for later phases"],
    outOfScope: ["Automatic mission or task generation", "Deploy or GitHub execution"],
  };
}
