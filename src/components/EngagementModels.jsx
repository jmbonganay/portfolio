import { ArrowUpRight, CheckCircle2, Layers3, Network, Rocket } from "lucide-react";
import "./business-sales-components.css";

const engagementModels = [
  {
    title: "The Frontend Sprint",
    eyebrow: "Conversion Build",
    description:
      "High-converting landing pages, CRO layout, and fast execution for campaigns that need to launch cleanly.",
    icon: Rocket,
    deliverables: [
      "Landing page or product page build",
      "CRO-focused section structure",
      "Responsive desktop and mobile UI",
      "Speed-conscious front-end handoff",
    ],
  },
  {
    title: "The Architecture Build",
    eyebrow: "Backend System",
    description:
      "Make.com pipelines, webhook routing, AI integration, and CRM automation for teams ready to remove manual work.",
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
    title: "The Hybrid Retainer",
    eyebrow: "Ongoing Partner",
    description:
      "Ongoing technical partnership for monthly optimizations, conversion improvements, and backend infrastructure scaling.",
    icon: Layers3,
    deliverables: [
      "Monthly landing page improvements",
      "Automation maintenance and iteration",
      "Analytics-informed CRO updates",
      "Scaling support for new workflows",
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
          Whether you need the page that captures demand, the backend that
          processes it, or a long-term technical partner who can improve both.
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
                Book a Scoping Call
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}
