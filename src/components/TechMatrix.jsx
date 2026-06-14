import { BarChart3, Cpu, Layout, Sparkles } from "lucide-react";
import "./tech-matrix.css";

const techCategories = [
  {
    title: "Conversion & Frontend Layer",
    description:
      "Designing and building high-performance, mobile-responsive interfaces optimized for maximum revenue and user flow.",
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
      "Connecting decoupled applications, syncing CRMs, and routing webhook data to ruthlessly eliminate manual data entry.",
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
      "Embedding LLM workflows directly into business ops to generate scopes, clean dirty data, and handle complex async tasks.",
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
      "Deploying enterprise analytics, handling domain migrations, and setting up secure server configurations.",
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
          The toolkits I deploy to build, automate, and scale.
        </h2>

        <p>
          A battle-tested stack spanning high-converting frontend design, complex
          backend data-routing, and custom AI-driven business infrastructure.
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
