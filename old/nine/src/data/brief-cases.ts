export type BriefCase = {
  n: string;
  tag: string;
  title: string;
  metric: string;
  body: string;
  badge: string;
  solid: boolean;
};

export const briefCases: BriefCase[] = [
  {
    n: "01",
    tag: "AI Automation · Financial Services",
    title: "Projected ~50% headcount exposure",
    metric: "50%",
    body: "Operational audit mapped subcontractor hours to rule-based workflows, then designed AI agents for quotes, email, routing, and intake inside the existing CRM.",
    badge: "Projected audit model",
    solid: true,
  },
  {
    n: "02",
    tag: "AI Automation · Service Business · Voice Agents",
    title: "$70,000 / yr annualized savings",
    metric: "$70k",
    body: "Technician dispatch, customer qualification, and receptionist triage were moved into AI phone agents and automated intake from the client's cost base.",
    badge: "$70k annualized",
    solid: true,
  },
  {
    n: "03",
    tag: "Browser Extension · Real Estate",
    title: "7 hours → under 1 minute",
    metric: "420×",
    body: "One-click CMA extension for live data aggregation, cross-platform listing comparison, and structured report generation.",
    badge: "7 hrs → <1 min",
    solid: true,
  },
  {
    n: "04",
    tag: "Graft · Studio of Optimisations · SvelteKit",
    title: "Conversational automation funnel",
    metric: "live",
    body: "Built optimisations.studio with voice entry, booking, MCP-backed tool streaming, status updates, and onboarding handoffs that keep context across sessions.",
    badge: "optimisations.studio",
    solid: false,
  },
  {
    n: "05",
    tag: "Brand · eCommerce · Packaging · Apps",
    title: "Automotive aftermarket transformation",
    metric: "0→1",
    body: "Brand system, packaging, bespoke commerce surface, and companion app direction across creative, product, and implementation.",
    badge: "Brand · Commerce · Apps",
    solid: false,
  },
];
