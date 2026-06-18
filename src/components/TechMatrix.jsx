import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Cpu,
  Layout,
  Sparkles,
} from "lucide-react";
import "./tech-matrix.css";

const workflowSteps = ["Plan", "Build", "Connect", "Track", "Launch"];

const techCategories = [
  {
    title: "Page Design & Front End Execution",
    benefit: "Turns campaign ideas into responsive pages clients can launch.",
    outcome: "Clearer pages",
    description:
      "I use this stack to shape page hierarchy, build responsive sections, and keep the CTA path clear across landing pages, product pages, and funnels.",
    icon: Layout,
    variant: "featured",
    useCases: ["Landing pages", "Product pages", "Responsive QA"],
    tools: [
      "Figma",
      "WordPress",
      "Shopify",
      "GoHighLevel",
      "React",
      "HTML",
      "CSS",
      "Responsive QA",
    ],
  },
  {
    title: "Lead Flow & Automation Systems",
    benefit: "Keeps form submissions and CRM movement from becoming messy.",
    outcome: "Cleaner handoff",
    description:
      "I connect forms, CRMs, email tools, and webhook flows so lead data moves into the right place with fewer manual steps.",
    icon: Cpu,
    variant: "automation",
    useCases: ["Lead routing", "CRM sync", "Webhook flows"],
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
    title: "AI Assisted Workflow Support",
    benefit: "Speeds up scoping, drafting, cleanup, and production support.",
    outcome: "Faster support",
    description:
      "I use AI carefully for proposal support, content structuring, data cleanup, and workflow assistance when it makes the project cleaner.",
    icon: Sparkles,
    variant: "ai",
    useCases: ["AI scoping", "Proposal drafts", "Data cleanup"],
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
    title: "Tracking, QA & Launch Operations",
    benefit: "Reduces last mile risk before traffic, leads, or payments go live.",
    outcome: "Safer launches",
    description:
      "I support the launch details around analytics, tags, domains, email sending, payments, forms, and production QA.",
    icon: BarChart3,
    variant: "operations",
    useCases: ["Tracking checks", "DNS and email", "Launch QA"],
    tools: [
      "GA4",
      "Google Tag Manager",
      "Cloudflare DNS",
      "Secure form gateway",
      "hCaptcha",
      "SendGrid",
      "PayMongo",
      "Xendit",
    ],
  },
];

const stackProofSignals = [
  "Design to responsive build",
  "Forms and CRM handoff",
  "Tracking and launch support",
  "Remote team friendly",
];

export default function TechMatrix() {
  return (
    <section className="tech-matrix-section" id="stack" aria-labelledby="tech-matrix-title">
      <div className="tech-matrix-shell">
        <div className="tech-matrix-header">
          <span className="tech-matrix-eyebrow">ENGINEERED STACK</span>

          <div className="tech-matrix-header__content">
            <div>
              <h2 id="tech-matrix-title">
                Tools chosen to design, build, connect, and launch with less friction.
              </h2>

              <p>
                My stack supports the full path from page structure and responsive
                build to CRM handoff, AI assisted workflows, tracking, QA, and launch
                operations.
              </p>
            </div>

            <div className="tech-matrix-summary" aria-label="Stack promise">
              <span>Stack purpose</span>
              <p>
                Practical tools selected around campaign clarity, cleaner handoff,
                and fewer launch surprises.
              </p>
            </div>
          </div>
        </div>

        <ol className="tech-matrix-flow" aria-label="Project workflow supported by the stack">
          {workflowSteps.map((step, index) => (
            <li key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {step}
            </li>
          ))}
        </ol>

        <div className="tech-matrix-grid">
          {techCategories.map((category, index) => {
            const Icon = category.icon;

            return (
              <article
                className={`tech-matrix-card tech-matrix-card--${category.variant}`}
                key={category.title}
              >
                <div className="tech-matrix-card__top">
                  <div className="tech-matrix-card__icon">
                    <Icon size={24} strokeWidth={2.2} aria-hidden="true" />
                  </div>

                  <span className="tech-matrix-card__index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="tech-matrix-card__body">
                  <span className="tech-matrix-outcome">{category.outcome}</span>
                  <h3>{category.title}</h3>
                  <strong>{category.benefit}</strong>
                  <p>{category.description}</p>
                </div>

                <div className="tech-matrix-use-cases">
                  <span>Used for</span>
                  <ul>
                    {category.useCases.map((useCase) => (
                      <li key={useCase}>{useCase}</li>
                    ))}
                  </ul>
                </div>

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

        <div className="tech-matrix-footer">
          <div className="tech-matrix-proof-list" aria-label="Stack proof points">
            {stackProofSignals.map((signal) => (
              <span key={signal}>
                <CheckCircle2 size={15} aria-hidden="true" />
                {signal}
              </span>
            ))}
          </div>

          <a className="tech-matrix-link" href="#work">
            See this stack in selected work
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
