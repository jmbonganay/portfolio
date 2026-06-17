import { FileText } from "lucide-react";
import "./ghl-automation-card.css";

const defaultMatrix = [
  { value: "GoHighLevel", label: "CRM ORCHESTRATION" },
  { value: "Advanced Routing", label: "MULTI TRIGGER LOGIC" },
  { value: "Wait Nodes", label: "PSYCHOLOGICAL DELAYS" },
  { value: "99.3%+ Delivery", label: "EMAIL DISPATCH" },
];

const defaultTags = ["GoHighLevel", "Client Deployment", "Deliverability"];
const aiAutomationTags = ["Backend", "AI Automation System"];

export default function GHLAutomationCard({ project, onViewMetrics }) {
  const matrix = project?.metrics?.length ? project.metrics : defaultMatrix;
  const tags = project?.badges?.length
    ? project.badges
    : project?.id === "automation-inbound-triage-crm"
      ? aiAutomationTags
      : defaultTags;
  const browserAddress =
    project?.modalAddress ||
    (project?.link?.includes("make.com")
      ? "make.com/scenarios/1023..."
      : "gohighlevel.com/workflows");

  return (
    <article className="ghl-card reveal-item is-visible">
      <div className="ghl-card__browser">
        <div className="ghl-card__browser-bar">
          <span />
          <span />
          <span />
          <p>{browserAddress}</p>
        </div>

        <div className="ghl-card__image-wrap">
          <img
            src={project?.image || "/work/ghl-production-automations.webp"}
            alt={project?.imageAlt || `${project?.title || "Automation project"} preview`}
            loading="lazy"
            decoding="async"
            width="1400"
            height="935"
            className="ghl-card__image"
          />
        </div>
      </div>

      <div className="ghl-card__body">
        <div className="ghl-card__meta-row">
          <p className="ghl-card__overline">{project?.type || "Enterprise CRM Automation"}</p>
          {project?.number ? <span className="ghl-card__number">{project.number}</span> : null}
        </div>

        <h3 className="ghl-card__title">
          {project?.title || "High converting GoHighLevel Lead Nurture & LTO Pipelines"}
        </h3>

        <p className="ghl-card__role">
          {project?.role || "Automation Strategist & Developer (Agency Deployment)"}
        </p>

        <p className="ghl-card__description">
          {project?.summary ||
            "A multi trigger production pipeline handling automatic CRM contact tagging, 15 minute operational wait nodes for optimized psychological engagement, and automated email follow up sequences achieving 99.3%+ deliverability for 689+ live leads."}
        </p>

        <div className="ghl-card__metric-grid" aria-label={`${project?.title || "GoHighLevel automation"} metadata`}>
          {matrix.map((metric) => (
            <div className="ghl-card__metric" key={`${project?.id || "ghl"}-${metric.label}`}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </div>
          ))}
        </div>

        <div className="ghl-card__tags" aria-label="Project tags">
          {tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>

        <div className="ghl-card__actions">
          <button type="button" className="ghl-card__button" onClick={() => onViewMetrics?.(project?.id)}>
            View Metrics
            <FileText size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
