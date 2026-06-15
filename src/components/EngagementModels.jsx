import { ArrowUpRight, CheckCircle2, Layers3, Network, Rocket } from "lucide-react";
import "./business-sales-components.css";

const engagementModels = [
  {
    title: "Landing Page / Product Page Build",
    eyebrow: "Client project",
    description:
      "For founders, agencies, and ecommerce teams that need a focused campaign page built around offer clarity, proof, CTA flow, and responsive polish.",
    icon: Rocket,
    deliverables: [
      "Landing page or product page build",
      "CRO-focused section structure",
      "Responsive desktop and mobile UI",
      "Speed-conscious front-end handoff",
    ],
  },
  {
    title: "Funnel & Automation Build",
    eyebrow: "Systems project",
    description:
      "For teams that need forms, CRM routes, Make.com workflows, GoHighLevel automations, or AI-assisted intake systems behind the front-end.",
    icon: Network,
    featured: true,
    deliverables: [
      "Webhook and API workflow mapping",
      "Make.com automation architecture",
      "AI / LLM proposal or triage logic",
      "CRM, Sheets, Gmail, and booking integrations",
    ],
  },
  {
    title: "Remote Front-End Contributor",
    eyebrow: "Recruiter path",
    description:
      "For hiring managers who need a reliable remote contributor for landing pages, ecommerce pages, campaign support, QA, and ongoing front-end improvements.",
    icon: Layers3,
    deliverables: [
        "Full-time or long-term contract availability",
        "Async updates and clean handoff notes",
        "Campaign page iteration and QA",
        "Shopify, WordPress, and GHL support",
    ],
  },
];

export default function EngagementModels() {
  function handleBookingClick(event) {
    event.preventDefault();
    document.getElementById("contact")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <section className="engagement-section" id="engagement-models">
      <div className="engagement-section__header">
        <span className="engagement-eyebrow">How to work with me</span>
        <h2>Choose the build model that matches your bottleneck.</h2>
        <p>
          Clear paths for clients who need a specific build and recruiters who
          need to understand where I fit on a remote team.
        </p>
      </div>

      <div className="engagement-grid">
        {engagementModels.map((model) => {
          const Icon = model.icon;

          return (
            <article
              className={`engagement-card ${
                model.featured ? "engagement-card--featured" : ""
              }`}
              key={model.title}
            >
              {model.featured ? (
                <span className="engagement-card__badge">Most strategic</span>
              ) : null}

              <div className="engagement-card__icon" aria-hidden="true">
                <Icon size={22} />
              </div>

              <span className="engagement-card__eyebrow">{model.eyebrow}</span>
              <h3>{model.title}</h3>

              <p className="engagement-card__description">{model.description}</p>

              <ul className="engagement-card__list">
                {model.deliverables.map((item) => (
                  <li key={item}>
                    <CheckCircle2 size={16} aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className="engagement-card__button"
                onClick={handleBookingClick}
              >
                Start a conversation
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}
