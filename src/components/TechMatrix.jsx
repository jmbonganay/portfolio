import { BarChart3, Cpu, Layout, Sparkles } from "lucide-react";
import "./tech-matrix.css";

const techCategories = [
  {
    title: "Front End & Conversion",
    outcome: "Clearer page decisions",
    description:
      "Build responsive landing pages, product pages, and funnel sections that are clear, fast, and easy to use.",
    icon: Layout,
    tools: [
      "Figma",
      "WordPress",
      "Shopify",
      "GoHighLevel",
      "HTML5",
      "CSS3",
      "Responsive QA",
    ],
  },
  {
    title: "Automations & Integrations",
    outcome: "Cleaner lead handoff",
    description:
      "Connect forms, CRMs, email tools, and webhook flows so lead data moves cleanly without manual work.",
    icon: Cpu,
    tools: [
      "Make.com",
      "n8n",
      "Zapier",
      "Webhooks",
      "REST APIs",
      "CRM Workflows",
    ],
  },
  {
    title: "AI Workflow Support",
    outcome: "Faster production support",
    description:
      "Use AI tools for proposal drafting, content support, data cleanup, and workflow assistance when it improves the process.",
    icon: Sparkles,
    tools: [
      "Gemini API",
      "ChatGPT",
      "Prompt Writing",
      "AI Scoping",
      "Proposal Drafting",
      "Data Cleanup",
    ],
  },
  {
    title: "Tracking & Operations",
    outcome: "More confident launches",
    description:
      "Set up analytics, tracking tags, domains, email sending, payments, and launch support for production campaigns.",
    icon: BarChart3,
    tools: [
      "Google Analytics",
      "Google Tag Manager",
      "Cloudflare DNS",
      "SendGrid",
      "PayMongo",
      "Xendit",
    ],
  },
];

export default function TechMatrix() {
  return (
    <section className="tech-matrix-section" id="stack" aria-labelledby="tech-matrix-title">
      <div className="tech-matrix-header">
        <span className="tech-matrix-eyebrow">ENGINEERED STACK</span>

        <h2 id="tech-matrix-title">
          Tools chosen for clearer pages, cleaner handoff, and safer launches.
        </h2>

        <p>
          These are the tools I use to design and build pages, connect lead flows,
          support AI assisted workflows, and prepare campaigns for launch.
        </p>
      </div>

      <div className="tech-matrix-grid">
        {techCategories.map((category, index) => {
          const Icon = category.icon;

          return (
            <article className="tech-matrix-card" key={category.title}>
              <div className="tech-matrix-card__top">
                <div className="tech-matrix-card__icon">
                  <Icon size={24} strokeWidth={2.2} aria-hidden="true" />
                </div>

                <span className="tech-matrix-card__index">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <h3>{category.title}</h3>
              <span className="tech-matrix-outcome">{category.outcome}</span>

              <p>{category.description}</p>

              <div
                className="tech-matrix-tags"
                aria-label={`${category.title} tools`}
              >
                {category.tools.map((tool) => (
                  <span className="tech-matrix-tag" key={tool}>
                    {tool}
                  </span>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
