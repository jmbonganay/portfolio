import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, X } from "lucide-react";
import TerminalLoader from "./TerminalLoader";

const MAKE_WEBHOOK_URL = "https://hook.us2.make.com/9m9aa72udl79axpeb8qkonm8l8i4dkps";

const automationDescription =
  "Engineered an asynchronous, multi-branching automation layer that captures portfolio payloads through low-latency webhooks, enriches lead context through REST API firmographic lookups, and routes qualified project ideas into a Gemini-powered proposal engine that dynamically compiles Google Doc templates into locked PDF scopes and dispatches them through email.";

const automationFeatureFallbacks = [
  {
    title: "Frontend Trigger Integration",
    copy:
      "Configured an asynchronous native JavaScript fetch() handler inside the portfolio contact flow to transmit structured form state to the automation layer without adding visible UI latency.",
  },
  {
    title: "Webhook Gateway",
    copy:
      "Implemented a low-latency Make.com webhook gateway as a micro-backend ingestion layer for names, emails, project categories, and freeform project intent payloads.",
  },
  {
    title: "Firmographic Enrichment",
    copy:
      "Parsed incoming email domains with Regex and routed business-domain leads through Abstract API to enrich records with corporate identifiers, company metadata, and operational context.",
  },
  {
    title: "Data Cleaning & Fallback Safety",
    copy:
      "Added conditional sanitization rules for personal email endpoints and incomplete payloads, ensuring the CRM receives clean fallback values instead of broken or null data frames.",
  },
  {
    title: "LLM Integration & Prompt Engineering",
    copy:
      "Isolated AI-scoping payloads through a dedicated submissionType signature and routed project ideas into Google Gemini 2.5 Flash using structured system instructions, allowing the workflow to generate concise, client-ready proposal content from raw intake data.",
  },
  {
    title: "Dynamic Document Compilation",
    copy:
      "Injected Gemini-generated scope content into a master Google Doc template through merge tags, compiled the document into a locked PDF deliverable, and autonomously dispatched the proposal back to the user through a Gmail module.",
  },
];


function AiProposalEngineForm() {
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    projectIdea: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));

    setIsSuccess(false);
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsLoading(true);
    setIsSuccess(false);
    setFormError("");

    try {
      const response = await fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formValues.name,
          email: formValues.email,
          projectIdea: formValues.projectIdea,
          submissionType: "ai_scoper",
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to trigger proposal engine.");
      }

      setFormValues({
        name: "",
        email: "",
        projectIdea: "",
      });
      setIsSuccess(true);
    } catch (error) {
      console.error("AI Proposal Engine error:", error);
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="ai-proposal-engine" aria-labelledby="ai-proposal-engine-title">
      <div className="ai-proposal-engine__header">
        <span className="ai-proposal-engine__eyebrow">Interactive Intake Terminal</span>
        <h3 id="ai-proposal-engine-title">Test the AI Proposal Engine</h3>
        <p>
          Submit a quick project concept and trigger the same Make.com automation
          pipeline used for inbound lead scoping.
        </p>
      </div>

      <form className="ai-proposal-engine__form" onSubmit={handleSubmit}>
        <label className="ai-proposal-engine__field">
          <span>Name</span>
          <input
            type="text"
            name="name"
            value={formValues.name}
            onChange={handleChange}
            placeholder="John Michael"
            autoComplete="name"
            required
          />
        </label>

        <label className="ai-proposal-engine__field">
          <span>Email</span>
          <input
            type="email"
            name="email"
            value={formValues.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>

        <label className="ai-proposal-engine__field">
          <span>Project Idea</span>
          <textarea
            name="projectIdea"
            value={formValues.projectIdea}
            onChange={handleChange}
            placeholder="Describe your app or website concept here..."
            rows="5"
            required
          />
        </label>

        {formError ? (
          <p className="ai-proposal-engine__error" role="alert">
            {formError}
          </p>
        ) : null}

        {isSuccess ? (
          <p className="ai-proposal-engine__success" role="status">
            AI Proposal Engine Triggered! Check your inbox in a few minutes.
          </p>
        ) : null}

        <button
          type="submit"
          className="ai-proposal-engine__submit"
          disabled={isLoading}
        >
          {isLoading ? "Analyzing Concept..." : "Trigger AI Proposal Engine"}
        </button>

        <TerminalLoader isLoading={isLoading} />
      </form>
    </section>
  );
}

const featureTitleMap = {
  "Asynchronous Webhook Gateway": "Webhook Gateway",
  "Firmographic REST API Data Enrichment": "Firmographic Enrichment",
  "CRM Ledger Synchronization": "CRM Synchronization",
};

export default function AutomationModal({ project, isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !project) {
    return null;
  }

  const calendlyUrl =
    project.calendlyUrl || "https://calendly.com/johnmichaelbonganay1231/30min";

  const technicalFeatures = (project.architectureDetails?.length
    ? project.architectureDetails
    : automationFeatureFallbacks
  )
    .filter((feature) => feature.title !== "Dynamic UX Conversion Layer")
    .map((feature) => ({
      title: featureTitleMap[feature.title] || feature.title,
      copy: feature.copy,
    }));

  return createPortal(
    <div className="automation-modal" role="dialog" aria-modal="true">
      <button
        type="button"
        className="automation-modal__backdrop"
        onClick={onClose}
        aria-label="Close backend system preview"
      />

      <aside className="automation-modal__panel" aria-labelledby="automation-modal-title">
        <div className="automation-modal__topbar">
          <div>
            <span className="automation-modal__label">BACKEND SYSTEM PREVIEW</span>
            <strong>{project.title}</strong>
          </div>

          <button
            type="button"
            className="automation-modal__close"
            onClick={onClose}
            aria-label="Close backend system preview"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="automation-modal__browser">
          <div className="automation-modal__browser-header">
            <span />
            <span />
            <span />
            <p>make.com/scenarios/1023...</p>
          </div>

          <div className="automation-modal__media">
            <img
              src={project.image}
              alt={project.imageAlt || `${project.title} backend architecture diagram`}
              loading="lazy"
              decoding="async"
              width="1835"
              height="879"
            />
          </div>
        </div>

        <div className="automation-modal__content">
          <span className="automation-modal__eyebrow">SELECTED WORK BREAKDOWN</span>

          <h2 id="automation-modal-title" className="automation-modal__title">
            {project.title}
          </h2>

          <p className="automation-modal__role">
            {project.role || "Backend Systems Architect & AI Workflow Engineer"}
          </p>

          <p className="automation-modal__description">
            {automationDescription}
          </p>

          <div className="automation-modal__feature-list" aria-label="Automation technical feature breakdown">
            {technicalFeatures.map((feature) => (
              <article className="automation-modal__feature" key={`${project.id}-${feature.title}`}>
                <h3>{feature.title}</h3>
                <p>{feature.copy}</p>
              </article>
            ))}
          </div>

          <AiProposalEngineForm />

          <div className="automation-modal__actions">
            <a
              href={calendlyUrl}
              target="_blank"
              rel="noreferrer"
              className="automation-modal__cta"
            >
              Test Live Booking Engine
              <ExternalLink size={16} aria-hidden="true" />
            </a>

            {project.link ? (
              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                className="automation-modal__secondary"
              >
                View Make Scenario
                <ExternalLink size={16} aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
