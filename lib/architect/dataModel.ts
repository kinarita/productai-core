export interface DataModelEntity {
  name: string;
  description: string;
  relationships: string[];
}

export function buildDataModel(): DataModelEntity[] {
  return [
    {
      name: "Mission",
      description: "Product mission with lifecycle, health, and planning summaries.",
      relationships: ["Task", "ProductBrief", "TechnicalSpecification"],
    },
    {
      name: "Task",
      description: "Work unit assigned to Mission Team roles.",
      relationships: ["Mission"],
    },
    {
      name: "ProductBrief",
      description: "CEO-approved planning artifact from Product Planner.",
      relationships: ["Mission", "Idea"],
    },
    {
      name: "TechnicalSpecification",
      description: "Architect-owned design specification for review.",
      relationships: ["Mission", "MissionPlan", "Review"],
    },
    {
      name: "Review",
      description: "Human-led artifact review comments and states.",
      relationships: ["TechnicalSpecification", "ProductBrief", "MissionPlan"],
    },
  ];
}
