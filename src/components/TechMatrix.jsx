import { BarChart3, Cpu, Layout, Sparkles } from "lucide-react";
import "./tech-matrix.css";

const techCategories = [
  {
    title: "Conversion & Frontend Layer",
    description:
      "Designing and building fast, responsive campaign pages with clear messaging, proof hierarchy, CTA flow, and mobile-first execution.",
    icon: Layout,
    tools: [
      "Figma",
      "WordPress",
      "Shopify",
      "GoHighLevel",
      "HTML5 / CSS3",
      "Responsive Design",
    ],
  },
  {
    title: "Integration & Automation Core",
    description:
      "Connecting forms, CRMs, webhooks, and follow-up systems so captured intent does not disappear into manual admin work.",
    icon: Cpu,
    tools: [
      "Make.com",
      "n8n",
      "Zapier",
      "Webhook Architecture",
      "API Integrations",
    ],
  },
  {
    title: "Autonomous Intelligence",
    description:
      "Using AI workflows where they improve speed and structure: intake triage, proposal scoping, data cleanup, and async operations.",
    icon: Sparkles,
    tools: [
      "Gemini API",
      "ChatGPT",
      "Prompt Engineering",
      "AI Pipeline Architecture",
    ],
  },
  {
    title: "Operations & Growth Tracking",
    description:
      "Supporting campaign launch details across analytics, tag setup, domains, email delivery, payment paths, and handoff readiness.",
    icon: BarChart3,
    tools: [
      "Google Analytics",
      "Google Tag Manager",
      "Cloudflare DNS",
      "SendGrid",
      "PayMongo / Xendit",
    ],
  },
];

export default function TechMatrix() {
  return (
    <section className="tech-matrix-section" id="stack" aria-labelledby="tech-matrix-title">
      <div className="tech-matrix-header">
        <span className="tech-matrix-eyebrow">ENGINEERED STACK</span>

        <h2 id="tech-matrix-title">
          The stack behind the page, the launch, and the follow-up.
        </h2>

        <p>
          I position myself as more than a visual page builder: I can support
          the conversion layer, the platform implementation, and the operational
          details that make a campaign easier to launch and maintain.
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
