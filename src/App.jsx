import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import ReactGA from "react-ga4";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import {
  ArrowUpRight,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  Code2,
  ExternalLink,
  FileText,
  Gauge,
  Lock,
  Mail,
  MapPin,
  Menu,
  Search,
  Send,
  Settings,
  ShoppingCart,
  TrendingUp,
  Workflow,
  X,
} from "lucide-react";
import johnMichaelPortrait from "./assets/john-michael.webp";
import BlurImage from "./components/BlurImage";
import ScrollToTop from "./components/ScrollToTop";
import AutomationModal from "./components/AutomationModal";
import GHLAutomationCard from "./components/GHLAutomationCard";
import StatusWidget from "./components/StatusWidget";
import { HoverCard, StaggeredGrid, StaggeredGridItem } from "./components/MotionWrappers";
import { profile } from "./data/profile";
import { projects } from "./data/projects";
import { imageDimensions } from "./data/imageDimensions";


const TechMatrix = lazy(() => import("./components/TechMatrix"));

function SectionFallback() {
  return (
    <div className="section-suspense-fallback" aria-hidden="true">
      <span />
    </div>
  );
}

function getImageDimensions(src, fallback = { width: 1200, height: 900 }) {
  return imageDimensions[src] ?? fallback;
}

const techStackItems = [
  { name: "Figma", mark: "Fg" },
  { name: "WordPress", mark: "WP" },
  { name: "Shopify", mark: "Sh" },
  { name: "GoHighLevel", mark: "GH" },
  { name: "HTML/CSS", mark: "</>" },
  { name: "Zapier", mark: "Za" },
  { name: "JavaScript", mark: "JS" },
  { name: "Figma", mark: "Fg" },
  { name: "API Integrations", mark: "API" },
  { name: "n8n", mark: "n8n" },
];
const WORK_PAGE_SIZE = 6;
const heroImage = "/assets/hero-command-center.webp";
// These are public frontend identifiers, not private server secrets.
// Vercel/Vite environment variables still override these defaults in production.
const DEFAULT_WEB3FORMS_ACCESS_KEY = "b07a88a1-7a8b-4307-a080-e13b3c51f57c";
const DEFAULT_HCAPTCHA_SITE_KEY = "50b2fe65-b00b-4b9e-ad62-3ba471098be2";
const WEB3FORMS_ACCESS_KEY =
  import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || DEFAULT_WEB3FORMS_ACCESS_KEY;
const HCAPTCHA_SITE_KEY =
  import.meta.env.VITE_HCAPTCHA_SITE_KEY || DEFAULT_HCAPTCHA_SITE_KEY;
const MAKE_WEBHOOK_URL = "https://hook.us2.make.com/9m9aa72udl79axpeb8qkonm8l8i4dkps";

const ALL_WORK_FILTER = "All";

const workFilters = ["All", "Shopify", "WordPress", "GoHighLevel", "Netlify", "Automations"];

function getProjectBadges(project) {
  return [project.category, project.type].filter(Boolean).slice(0, 3);
}

const navLinks = [
  { label: "Work", href: "#work" },
  { label: "Stack", href: "#stack" },
  { label: "Automation", href: "#automation" },
  { label: "Role Fit", href: "#role-fit" },
  { label: "Contact", href: "#contact" },
];

const heroPlatformTags = [
  { label: "WordPress LPs", filterId: "WordPress" },
  { label: "Shopify pages", filterId: "Shopify" },
  { label: "Automations", filterId: "Automations" },
];

function LocalPhtClock() {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    function updateTime() {
      const formattedTime = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Manila",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(new Date());

      setCurrentTime(formattedTime);
    }

    updateTime();
    const timer = window.setInterval(updateTime, 60 * 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <span
      className="hero__local-time"
      aria-label="Current local time in the Philippines"
    >
      <span className="local-time-beacon" aria-hidden="true" />
      Local Time: {currentTime} PHT
    </span>
  );
}

const selectedWorkMeta = {
  "barkchester-united": {
    title: "High converting Shopify Product Page",
    role: "Built Shopify product page, improved offer layout, handled responsive QA.",
  },
  "vista-veil": {
    title: "Beauty tech Shopify Product Page",
    role: "Built Shopify offer page, shaped product story, handled responsive QA.",
  },
  "grippit-strength": {
    title: "Health Product Shopify Sales Page",
    role: "Shopify build, offer layout, responsive product QA",
  },
  "wordpress-funnelkit-2m": {
    title: "Marketing Funnel Revenue Snapshot",
    role: "Supported WordPress funnel flow, reviewed checkout UX, documented sales proof.",
  },
  "wordpress-campaign-2m": {
    title: "WooCommerce Campaign Sales Proof",
    role: "Supported WooCommerce campaign flow, prepared NDA safe performance proof.",
  },
  "wordpress-checkout-153k": {
    title: "Checkout Flow Performance Snapshot",
    role: "Reviewed checkout flow, supported payment path QA, prepared sales proof.",
  },
  aquablast: {
    title: "Responsive WordPress Landing Page",
    role: "Built WordPress landing page, improved hero flow, handled mobile layout.",
  },
  "brite-buff": {
    title: "Beauty Product WordPress Page",
    role: "Built WordPress product page, clarified benefits, improved CTA path.",
  },
  "medtraker-pro": {
    title: "Health Product Landing Page",
    role: "Built WordPress landing page, organized product education, improved CTA flow.",
  },
  "ziptite-pro": {
    title: "eCommerce WordPress Product Page",
    role: "Built WordPress product page, added proof flow, improved order CTA layout.",
  },
  "nest-marketing": {
    title: "Lead generation Agency Website",
    role: "Built responsive agency site, refined service positioning, supported Netlify launch.",
  },
  "skeeter-strike-update": {
    title: "Direct response Advertorial Page",
    role: "Built advertorial page, shaped story flow, improved CTA hierarchy.",
  },
  "vistaveil-executives": {
    title: "Beauty tech Advertorial Page",
    role: "Built advertorial UX, structured problem aware messaging, improved offer bridge.",
  },
  "grippit-nurse": {
    title: "Health Product Advertorial",
    role: "Built long form sales page, refined story flow, improved mobile reading.",
  },
};

function getCompactProjectSummary(project) {
  const summary = project.summary || project.description || "";

  const manualSummaries = {
    "barkchester-united": "Pet focused Shopify page built around emotional offer messaging, review proof, benefit copy, and a clear purchase path.",
    "vista-veil": "Beauty tech Shopify page with benefit led sections, review proof, pricing contrast, and clean purchase flow.",
    "robo-mouse": "Playful Shopify product page built around cat owner pain points, product education, and bundle offers.",
    "skin-spectra": "Long form beauty page structured for education, proof, bundle positioning, and mobile purchase confidence.",
    "grippit-strength": "Direct response Shopify page with benefit messaging, social proof, pricing contrast, and bundle cards.",
    "furbulous-spa-brush": "Pet care Shopify page with playful product visuals, grooming benefits, review proof, and bundle offers.",
    "nest-marketing": "Responsive agency website with service positioning, clean layout hierarchy, and Netlify deployment support.",
  };

  const compact = manualSummaries[project.id] || summary;

  if (compact.length <= 185) {
    return compact;
  }

  const trimmed = compact.slice(0, 182);
  return `${trimmed.slice(0, Math.max(0, trimmed.lastIndexOf(" ")))}.`;
}

function getContributionLine(project, displayRole) {
  if (displayRole) {
    return displayRole.endsWith(".") ? displayRole : `${displayRole}.`;
  }

  const category = project.category || "";

  if (category === "Shopify") {
    return "Built Shopify page, refined offer layout, handled responsive QA.";
  }

  if (category === "WordPress") {
    return "Built WordPress landing page, improved CTA flow, supported launch QA.";
  }

  if (category === "GoHighLevel") {
    return "Built GoHighLevel page or workflow, connected CRM flow, supported launch QA.";
  }

  if (category === "Netlify") {
    return "Built responsive website, refined service positioning, supported Netlify launch.";
  }

  return "Handled page structure, responsive execution, and launch ready QA.";
}

function getResultMetrics(project) {
  if (!Array.isArray(project.metrics)) {
    return [];
  }

  const preferredLabels = ["Total sales", "Conversion", "Orders", "Sessions"];
  const picked = [];

  preferredLabels.forEach((label) => {
    const match = project.metrics.find((metric) => metric.label === label);
    if (match && !picked.some((item) => item.label === match.label)) {
      picked.push(match);
    }
  });

  project.metrics.forEach((metric) => {
    if (picked.length < 2 && !picked.some((item) => item.label === metric.label)) {
      picked.push(metric);
    }
  });

  return picked.slice(0, 2);
}

function getProjectResult(project) {
  const metrics = getResultMetrics(project);

  if (!metrics.length) {
    return project.result || "Launch ready build with clear contribution and platform proof.";
  }

  const [primary, secondary] = metrics;
  const first = `${primary.value} ${primary.label.toLowerCase()}`;
  const second = secondary ? `, ${secondary.value} ${secondary.label.toLowerCase()}` : "";
  return `${first}${second}.`;
}

function getCompactProjectBadges(project) {
  return getProjectBadges(project).slice(0, 2);
}
const automationTools = [
  {
    id: "wordpress",
    name: "WordPress",
    mark: "WP",
    detail: "Forms and landing pages",
    position: "source-wordpress",
  },
  {
    id: "shopify",
    name: "Shopify",
    mark: "Sh",
    detail: "Product pages and checkout",
    position: "source-shopify",
  },
  {
    id: "gohighlevel",
    name: "GoHighLevel",
    mark: "GH",
    detail: "Pipelines and follow up",
    position: "output-ghl",
  },
  {
    id: "zapier",
    name: "Zapier",
    mark: "Za",
    detail: "Quick app handoffs",
    position: "hub-zapier",
  },
  {
    id: "n8n",
    name: "n8n",
    mark: "n8n",
    detail: "Custom logic routes",
    position: "hub-n8n",
  },
  {
    id: "analytics",
    name: "Analytics",
    mark: "GA",
    detail: "Tracking and reporting",
    position: "output-analytics",
  },
];

const automationConnections = [
  {
    id: "wordpress",
    className: "connection-path--one",
    d: "M 170 122 C 295 130 362 225 442 286",
  },
  {
    id: "shopify",
    className: "connection-path--two",
    d: "M 170 500 C 295 492 362 398 442 338",
  },
  {
    id: "zapier",
    className: "connection-path--three",
    d: "M 500 118 C 500 176 500 212 500 244",
  },
  {
    id: "n8n",
    className: "connection-path--four",
    d: "M 500 504 C 500 446 500 410 500 376",
  },
  {
    id: "gohighlevel",
    className: "connection-path--five",
    d: "M 875 126 C 724 136 642 226 558 286",
  },
  {
    id: "analytics",
    className: "connection-path--six",
    d: "M 830 498 C 705 488 635 398 558 338",
  },
];

const automationCards = [
  {
    id: "lead-capture",
    icon: Workflow,
    title: "Leads reach the right place",
    summary:
      "Form and checkout data can move into the right pipeline instead of sitting in inboxes or scattered spreadsheets.",
    activeNodes: ["wordpress", "zapier", "gohighlevel"],
  },
  {
    id: "automation-launches",
    icon: Settings,
    title: "Launches are ready to follow up",
    summary:
      "Pages can ship with confirmations, tracking, and follow up paths planned before campaign traffic goes live.",
    activeNodes: ["wordpress", "shopify", "zapier", "n8n", "analytics"],
  },
  {
    id: "less-manual-work",
    icon: Bot,
    title: "Less manual work after launch",
    summary:
      "Automation helps reduce duplicate entry, missed leads, and slow response loops across the tools a campaign already uses.",
    activeNodes: ["zapier", "n8n", "gohighlevel", "analytics"],
  },
];
const roleFitCards = [
  {
    icon: Code2,
    title: "Front end execution",
    summary:
      "A strong fit for teams that need clean page builds, responsive layouts, and conversion focused implementation without heavy handholding.",
    points: [
      "Responsive landing pages and funnel sections",
      "Shopify and WordPress build support",
      "Front end QA across desktop and mobile",
    ],
  },
  {
    icon: Workflow,
    title: "Automation support",
    summary:
      "I can support the systems around the page, so leads are captured, routed, tagged, and followed up without unnecessary manual work.",
    points: [
      "CRM routing and automation workflows",
      "Make.com, GoHighLevel, Zapier, and n8n support",
      "Forms, webhooks, notifications, and handoff flows",
    ],
  },
  {
    icon: BriefcaseBusiness,
    title: "Remote work style",
    summary:
      "Practical, reliable, and comfortable working with clients or teams that need clear communication and steady delivery.",
    points: [
      "Available for freelance and full time remote roles",
      "Comfortable with async collaboration",
      "US, UK, and AU timezone overlap",
    ],
  },
];
const hireConfidencePillars = [
  {
    icon: TrendingUp,
    title: "Conversion comes before decoration",
    summary:
      "I plan the page around the offer, CTA path, proof, and mobile scanning behavior, not just the visual layout.",
  },
  {
    icon: Workflow,
    title: "The page and workflow connect",
    summary:
      "I can support forms, routing, notifications, and CRM handoff so the lead path does not stop after submission.",
  },
  {
    icon: Gauge,
    title: "Launch details are checked",
    summary:
      "I look at responsive behavior, links, forms, tracking support, and basic QA before a page is sent traffic.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Easy to work with remotely",
    summary:
      "You get clear updates, practical handoff notes, and steady execution across freelance projects or team support.",
  },
  {
    icon: Code2,
    title: "Flexible across campaign platforms",
    summary:
      "I can work across Shopify, WordPress, GoHighLevel, funnels, product pages, and campaign landing pages.",
  },
];


const faqItems = [
  {
    question: "Do you handle both design and development?",
    answer:
      "Yes. I can plan the layout, design the page, build the front end, and check the responsive behavior before launch.",
  },
  {
    question: "Do you also support automations and tracking setup?",
    answer:
      "Yes. I can help connect forms, webhooks, CRM routing, notifications, and basic tracking support so the page has a clear handoff after someone submits.",
  },
  {
    question: "Which platforms do you work with?",
    answer:
      "My strongest fit is Shopify, WordPress, GoHighLevel, React front ends, Make.com, Zapier, n8n, and campaign landing page workflows.",
  },
  {
    question: "Can you improve an existing landing page?",
    answer:
      "Yes. I can review an existing page, tighten the hierarchy, improve the CTA path, clean up mobile issues, and support the rebuild or refinement.",
  },
  {
    question: "What kind of projects are you the best fit for?",
    answer:
      "I am a strong fit for landing pages, funnels, product pages, lead capture flows, campaign pages, and automation supported launch work.",
  },
  {
    question: "Do you work with remote teams and freelance clients?",
    answer:
      "Yes. I work well with async teams, agencies, founders, and recruiters who need clear updates, reliable handoff, and steady execution.",
  },
];
const hireConfidenceSignals = [
  "4+ years across landing pages and campaign assets",
  "Front end build, QA, tracking, and automation support",
  "Remote ready for freelance builds and team roles",
];
const contactProjectTypes = [
  "Landing page",
  "Website build",
  "Automation",
  "Remote role",
];
const contactTrustSignals = [
  "US, UK, and AU overlap",
  "Remote ready setup",
  "Clear updates and handoff",
];
const initialContactForm = {
  name: "",
  email: "",
  projectType: "",
  message: "",
};
const capabilityCards = [
  {
    title: "Shopify product pages",
    icon: ShoppingCart,
    summary:
      "Offer led product pages with gallery flow, bundles, reviews, trust blocks, and mobile purchase clarity.",
    chips: ["Product story", "Offer sections", "Checkout path"],
  },
  {
    title: "WordPress landing pages",
    icon: FileText,
    summary:
      "Campaign pages built around visual hierarchy, responsive sections, fast scanning, and clear CTA timing.",
    chips: ["Campaign pages", "Responsive build", "Launch QA"],
  },
  {
    title: "CRO improvements",
    icon: TrendingUp,
    summary:
      "Sharper page structure, CTA visibility, trust placement, objection handling, and conversion focused UX cleanup.",
    chips: ["CTA audit", "Section flow", "Trust proof"],
  },
  {
    title: "Funnels & automation",
    icon: Workflow,
    summary:
      "Lead forms, GoHighLevel workflows, Zapier/n8n routes, analytics support, and practical handoff systems.",
    chips: ["Forms", "CRM routes", "Tracking"],
  },
];
const methodologyCards = [
  {
    phase: "Plan",
    icon: Search,
    summary:
      "Clarify the offer, traffic source, audience, conversion goal, page flow, and proof hierarchy.",
    output: "Goal brief + section map",
  },
  {
    phase: "Build",
    icon: Code2,
    summary:
      "Design and develop the experience inside the right platform with responsive sections and clean CTA paths.",
    output: "Live ready page build",
  },
  {
    phase: "QA",
    icon: Gauge,
    summary:
      "Check mobile layout, forms, links, tracking support, browser behavior, speed basics, and handoff notes.",
    output: "Launch checklist + fixes",
  },
];
const capabilityProofs = [
  "Conversion first layout",
  "Responsive QA",
  "Automation ready handoff",
];

function validateContactForm(values, selectedProjectType = values.projectType) {
  const errors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!values.name.trim()) {
    errors.name = "Enter your name.";
  }

  if (!emailPattern.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (values.message.trim().length < 20) {
    errors.message = "Add at least 20 characters so I can understand the goal.";
  }

  return errors;
}

function NoiseOverlay() {
  return <div className="ui-noise" aria-hidden="true" />;
}

function MagneticCTA({
  as: Component = "a",
  className = "",
  children,
  strength = 10,
  style,
  onMouseMove,
  onMouseLeave,
  ...props
}) {
  const magneticRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  function handleMouseMove(event) {
    onMouseMove?.(event);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const element = magneticRef.current;

    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const relativeX = event.clientX - rect.left - rect.width / 2;
    const relativeY = event.clientY - rect.top - rect.height / 2;

    setPosition({
      x: (relativeX / rect.width) * strength,
      y: (relativeY / rect.height) * strength,
    });
  }

  function handleMouseLeave(event) {
    onMouseLeave?.(event);
    setPosition({ x: 0, y: 0 });
  }

  return (
    <Component
      ref={magneticRef}
      className={`magnetic-cta ${className}`.trim()}
      style={{
        ...style,
        "--magnetic-x": `${position.x}px`,
        "--magnetic-y": `${position.y}px`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <span className="magnetic-cta__content">{children}</span>
    </Component>
  );
}

function ProjectCard({ project, onOpenCaseStudy, index = 0 }) {
  const showcase = selectedWorkMeta[project.id];
  const displayTitle = showcase?.title ?? project.title;
  const displayRole = showcase?.role ?? project.role;
  const canOpenCaseStudy = Boolean(project.caseStudy || project.caseStudyData);

  return (
    <article
      className="project-card reveal-item"
      style={{
        "--card-delay": `${Math.min(index, 8) * 45}ms`,
        "--reveal-delay": `${Math.min(index % WORK_PAGE_SIZE, 5) * 70}ms`,
      }}
    >
      <div className="project-media">
        <div className="project-browser" aria-hidden="true">
          <span />
          <span />
          <span />
          <p>
            {project.nda
              ? "NDA safe proof"
              : project.link
                ? new URL(project.link).hostname.replace("www.", "")
                : "Case study preview"}
          </p>
        </div>

        <BlurImage
          className="project-media__image"
          wrapperClassName="project-media__image-shell"
          src={project.image}
          alt={project.imageAlt}
          width={getImageDimensions(project.image).width}
          height={getImageDimensions(project.image).height}
          sizes="(max-width: 720px) 92vw, (max-width: 1120px) 46vw, 360px"
          loading="lazy"
          decoding="async"
        />

        <div className="project-overlay" aria-hidden="true">
          <span>{project.type}</span>
          <h3>{displayTitle}</h3>
          <p>{displayRole}</p>
        </div>
      </div>

      <div className="project-body">
        <div className="project-topline">
          <span>{project.type}</span>
          <strong>{project.number}</strong>
        </div>

        <h3>{displayTitle}</h3>
        <p className="project-summary">{getCompactProjectSummary(project)}</p>

        <div className="project-role">
          <BriefcaseBusiness size={16} aria-hidden="true" />
          <span>
            <strong>My contribution</strong>
            {getContributionLine(project, displayRole)}
          </span>
        </div>

        <div className="project-result">
          <BarChart3 size={16} aria-hidden="true" />
          <span>
            <strong>Result</strong>
            {getProjectResult(project)}
          </span>
        </div>

        <div
          className="project-metrics project-metrics--compact"
          aria-label={`${project.title} key metrics`}
        >
          {getResultMetrics(project).map((metric) => (
            <div className="project-metric" key={`${project.id}-${metric.label}`}>
              <strong className="project-metric__value">{metric.value}</strong>
              <span className="project-metric__label">{metric.label}</span>
            </div>
          ))}
        </div>

        {project.proofImage ? (
          <div className="project-proof-compact">
            <BarChart3 size={15} aria-hidden="true" />
            <span>Dashboard proof available. Sensitive data excluded.</span>
          </div>
        ) : null}

        <div className="project-tags">
          {getCompactProjectBadges(project).map((badge) => (
            <span key={`${project.id}-${badge}`}>{badge}</span>
          ))}
        </div>

        <div className="project-actions project-actions--split">
          {project.link ? (
            <a
              className="project-action project-action--live"
              href={project.link}
              target="_blank"
              rel="noreferrer"
            >
              View live page
              <ExternalLink size={16} aria-hidden="true" />
            </a>
          ) : (
            <span className="project-locked">
              <Lock size={15} aria-hidden="true" />
              Live page hidden by NDA
            </span>
          )}

          <button
            className="project-action project-action--case-study"
            type="button"
            onClick={() => onOpenCaseStudy(project.id)}
            disabled={!canOpenCaseStudy}
          >
            <FileText size={16} aria-hidden="true" />
            Case study
          </button>
        </div>
      </div>
    </article>
  );
}


function AutomationArchitectureCard({ project, onOpenModal, index = 0 }) {
  const automationMetrics = project.metrics?.length
    ? project.metrics
    : [
        { value: "Make.com / Webhooks", label: "Orchestration" },
        { value: "Gemini 2.5 Flash", label: "LLM Scoping" },
        { value: "Google Docs → PDF", label: "Dynamic Proposal" },
        { value: "Sheets + Gmail", label: "CRM + Dispatch" },
      ];

  function handleCalendlyClick(event) {
    if (project.calendlyUrl === "#contact") {
      event.preventDefault();
      document.getElementById("contact")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  function handleCaseStudyClick() {
    onOpenModal?.(project.id);
  }

  return (
    <article
      className="automation-architecture-card reveal-item is-visible"
      style={{
        "--card-delay": `${Math.min(index, 8) * 45}ms`,
        "--reveal-delay": `${Math.min(index % WORK_PAGE_SIZE, 5) * 70}ms`,
      }}
    >
      <div className="automation-architecture-card__media">
        <div className="automation-architecture-card__browser" aria-hidden="true">
          <span />
          <span />
          <span />
          <p>make.com/scenarios/1023...</p>
        </div>

        <BlurImage
          className="automation-architecture-card__image"
          wrapperClassName="automation-architecture-card__image-shell"
          src={project.image}
          alt={project.imageAlt}
          width={getImageDimensions(project.image, { width: 1835, height: 879 }).width}
          height={getImageDimensions(project.image, { width: 1835, height: 879 }).height}
          sizes="(max-width: 720px) 92vw, (max-width: 1120px) 46vw, 420px"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="automation-architecture-card__content">
        <span className="automation-architecture-card__eyebrow">
          Backend Automation System
        </span>

        <div className="automation-architecture-card__headline">
          <h3>{project.title}</h3>
          <p>{project.role}</p>
        </div>

        <p className="automation-architecture-card__summary">
          {project.summary}
        </p>

        <div
          className="automation-architecture-card__matrix"
          aria-label={`${project.title} backend automation metadata`}
        >
          {automationMetrics.map((metric) => (
            <div key={`${project.id}-${metric.label}`}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </div>
          ))}
        </div>

        <div className="automation-architecture-card__tags" aria-label="Automation project tags">
          <span>Backend</span>
          <span>AI Automation System</span>
        </div>

        <div className="automation-architecture-card__actions">
          <a
            className="automation-architecture-card__cta"
            href={project.calendlyUrl ?? "#contact"}
            target={project.calendlyUrl?.startsWith("http") ? "_blank" : undefined}
            rel={project.calendlyUrl?.startsWith("http") ? "noreferrer" : undefined}
            onClick={handleCalendlyClick}
          >
            Test live engine
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>

          <button
            className="automation-architecture-card__secondary"
            type="button"
            onClick={handleCaseStudyClick}
          >
            Case study
            <FileText size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}

function CaseStudyDrawer({ project, onClose }) {
  if (!project?.caseStudy && !project?.caseStudyData) {
    return null;
  }

  const caseStudy = project.caseStudy ?? {
    headline: `${project.title} case study preview`,
    overview:
      "A premium case study page is being prepared. This drawer keeps the project system ready for deeper storytelling, proof notes, conversion decisions, and execution breakdowns.",
    challenge:
      "The page needed a clear conversion path, stronger visual hierarchy, platform specific execution, and enough proof to build trust before the visitor reaches the CTA.",
    solution:
      "Structured the layout around the offer, audience intent, responsive scanning behavior, proof placement, CTA timing, and launch ready front end execution.",
    techStack: [project.category, project.type].filter(Boolean),
  };

  const techStackItems = caseStudy.techStack?.length
    ? caseStudy.techStack
    : [project.category, project.type].filter(Boolean);

  const projectHost = project.nda
    ? "NDA safe case study"
    : project.link
      ? new URL(project.link).hostname.replace("www.", "")
      : "Case study preview";

  function handleStartBuildClick() {
    onClose?.();

    window.setTimeout(() => {
      document.getElementById("contact")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 180);
  }

  return (
    <div
      className="case-drawer-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <aside
        className="case-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`case-drawer-title-${project.id}`}
      >
        <div className="case-drawer__topbar">
          <div>
            <span className="case-drawer__eyebrow">Case study preview</span>
            <strong>{project.type}</strong>
          </div>

          <button
            className="case-drawer__close"
            type="button"
            onClick={onClose}
            aria-label="Close case study drawer"
            autoFocus
          >
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <div className="case-drawer__media">
          <div className="project-browser" aria-hidden="true">
            <span />
            <span />
            <span />
            <p>{projectHost}</p>
          </div>

          <BlurImage
            src={project.image}
            alt={project.imageAlt}
            width={getImageDimensions(project.image).width}
            height={getImageDimensions(project.image).height}
            sizes="(max-width: 720px) 92vw, 720px"
            wrapperClassName="case-drawer__image-shell"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="case-drawer__content">
          <div>
            <p className="section-kicker">Selected work breakdown</p>
            <h2 id={`case-drawer-title-${project.id}`}>{caseStudy.headline}</h2>
            <p>{caseStudy.overview}</p>
          </div>

          <div
            className="case-drawer__metrics"
            aria-label={`${project.title} conversion metrics`}
          >
            {project.metrics.slice(0, 4).map((metric) => (
              <div key={`drawer-${project.id}-${metric.label}`}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>

          <div className="case-drawer__sections">
            <article>
              <span>The Challenge</span>
              <p>{caseStudy.challenge}</p>
            </article>

            <article>
              <span>The Solution</span>
              <p>{caseStudy.solution ?? caseStudy.approach}</p>
            </article>

            <article>
              <span>Tech Stack Used</span>
              <div className="case-drawer__stack">
                {techStackItems.map((item) => (
                  <em key={`${project.id}-${item}`}>{item}</em>
                ))}
              </div>
            </article>

            <article>
              <span>Conversion Metrics</span>
              <p>
                Metrics are displayed as proof signals from the project card and can be expanded
                into a full CRO breakdown later.
              </p>
            </article>
          </div>

          <div className="case-drawer__actions">
            {project.link ? (
              <a href={project.link} target="_blank" rel="noreferrer">
                View live page
                <ExternalLink size={16} aria-hidden="true" />
              </a>
            ) : (
              <span className="project-locked">
                <Lock size={15} aria-hidden="true" />
                Live page hidden by NDA
              </span>
            )}

            <MagneticCTA
              as="button"
              className="btn btn--primary"
              type="button"
              onClick={handleStartBuildClick}
              strength={7}
            >
              Discuss similar project
              <Send size={16} aria-hidden="true" />
            </MagneticCTA>
          </div>
        </div>
      </aside>
    </div>
  );
}


function HireConfidenceSection() {
  return (
    <section
      className="hire-confidence-section"
      aria-labelledby="hire-confidence-title"
    >
      <div className="hire-confidence-shell">
        <div className="hire-confidence-heading">
          <p className="section-kicker">Why clients hire me</p>
          <h2 id="hire-confidence-title">
            A lower risk hire for landing pages, funnels, and the systems behind them.
          </h2>
          <p>
            I do not treat a page as a standalone design file. I think through the offer,
            CTA path, mobile behavior, form handoff, and launch details so the work is
            easier to trust before traffic goes live.
          </p>
        </div>

        <div className="hire-confidence-layout">
          <aside className="hire-confidence-lead-card">
            <span className="hire-confidence-lead-card__eyebrow">Decision support</span>
            <h3>Built for clients who need a page to work, not just look finished.</h3>
            <p>
              A good fit when you need someone who can design, build, QA, and support
              the workflow around a campaign without adding extra coordination burden.
            </p>

            <div className="hire-confidence-signal-list" aria-label="Trust signals">
              {hireConfidenceSignals.map((signal) => (
                <span key={signal}>
                  <CheckCircle2 size={15} aria-hidden="true" />
                  {signal}
                </span>
              ))}
            </div>
          </aside>

          <div className="hire-confidence-grid">
            {hireConfidencePillars.map((pillar) => {
              const Icon = pillar.icon;

              return (
                <article className="hire-confidence-card" key={pillar.title}>
                  <span className="hire-confidence-card__icon">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.summary}</p>
                </article>
              );
            })}
          </div>
        </div>

        <div className="hire-confidence-footer">
          <p>
            Strong fit for conversion focused builds, launch support, and remote team execution.
          </p>

          <div className="hire-confidence-actions">
            <a className="btn btn--primary" href="#contact">
              <Mail size={18} aria-hidden="true" />
              Start a quick inquiry
            </a>
            <a className="btn btn--secondary" href="#automation">
              <Workflow size={18} aria-hidden="true" />
              View automation support
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}


function FAQSection() {
  return (
    <section className="faq-section" aria-labelledby="faq-title">
      <div className="faq-shell">
        <div className="faq-heading">
          <p className="section-kicker">Common questions</p>
          <h2 id="faq-title">A few practical answers before you reach out.</h2>
          <p>
            Clear scope, smoother handoff, and fewer unknowns before a landing page,
            funnel, or automation supported build starts.
          </p>
        </div>

        <div className="faq-list">
          {faqItems.map((item, index) => (
            <details className="faq-item" key={item.question} open={index === 0}>
              <summary>
                <span>{item.question}</span>
                <span className="faq-item__control" aria-hidden="true">
                  <span />
                  <span />
                </span>
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}


function RoleFitSection() {
  return (
    <section
      className="role-fit-section"
      id="role-fit"
      aria-labelledby="role-fit-title"
    >
      <div className="role-fit-shell">
        <div className="role-fit-heading">
          <p className="section-kicker">Role Fit</p>
          <h2 id="role-fit-title">I fit teams that need pages built well and leads handled properly.</h2>
          <p>
            I bring front end execution, conversion thinking, automation support,
            and clear handoff into one practical workflow. That makes me useful
            for freelance builds, campaign support, and remote roles.
          </p>
        </div>

        <div className="role-fit-grid">
          {roleFitCards.map((card) => {
            const Icon = card.icon;

            return (
              <article className="role-fit-card" key={card.title}>
                <span className="role-fit-card__icon">
                  <Icon size={20} aria-hidden="true" />
                </span>

                <h3>{card.title}</h3>
                <p>{card.summary}</p>

                <ul>
                  {card.points.map((point) => (
                    <li key={point}>
                      <CheckCircle2 size={15} aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        <div className="role-fit-actions-wrap">
          <p className="role-fit-availability">
            Open to project work, ongoing support, and full time remote opportunities.
          </p>

          <div className="role-fit-actions">
            <a className="btn btn--primary" href="#contact">
              <Mail size={18} aria-hidden="true" />
              Contact me
            </a>

            <a
              className="btn btn--secondary"
              href={profile.resumePath}
              download="JohnMichael_Bonganay_Resume.pdf"
            >
              <FileText size={18} aria-hidden="true" />
              Download resume
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}


function AutomationSection() {
  const [activeFeature, setActiveFeature] = useState(null);

  const activeCard = automationCards.find((card) => card.id === activeFeature);
  const activeNodes = activeCard?.activeNodes ?? [];
  const hasActiveFeature = Boolean(activeFeature);

  function isNodeActive(nodeId) {
    return activeNodes.includes(nodeId);
  }

  return (
    <section
      className="automation-section"
      id="automation"
      aria-labelledby="automation-title"
    >
      <div className="automation-shell">
        <div className="automation-heading">
          <p className="section-kicker">Systems Support</p>

          <div>
            <h2 id="automation-title">
              The system behind the conversion.
            </h2>

            <p>
              Landing pages work better when capture, routing, tracking, and follow up are planned from the start. I build with the next step in mind, so leads do not stop at the form.
            </p>
          </div>
        </div>

        <div className="automation-layout">
          <div
            className={
              hasActiveFeature
                ? "automation-map automation-map--mobile-safe has-active-feature"
                : "automation-map automation-map--mobile-safe"
            }
            aria-label="Marketing workflow integration map"
          >
            <div className="automation-grid" aria-hidden="true" />


            <svg
              className="automation-connections"
              viewBox="0 0 1000 620"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {automationConnections.map((connection) => {
                const isActive = isNodeActive(connection.id);

                return (
                  <path
                    key={connection.id}
                    className={[
                      "connection-path",
                      connection.className,
                      hasActiveFeature && !isActive ? "is-dimmed" : "",
                      isActive ? "is-active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    d={connection.d}
                  />
                );
              })}
            </svg>

            <div className="automation-core" aria-label="Automation hub">
              <span>Lead flow</span>
              <strong>Capture to follow up</strong>
            </div>

            {automationTools.map((tool) => {
              const nodeIsActive = isNodeActive(tool.id);

              return (
                <div
                  className={[
                    "automation-node",
                    `automation-node--${tool.position}`,
                    hasActiveFeature && !nodeIsActive ? "is-dimmed" : "",
                    nodeIsActive ? "is-highlighted" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={tool.id}
                >
                  <span className="automation-logo-slot" aria-hidden="true">
                    <span>{tool.mark}</span>
                  </span>

                  <div>
                    <strong>{tool.name}</strong>
                    <small>{tool.detail}</small>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="automation-panel" aria-label="Automation benefits">
            <p className="automation-panel__intro">
              The map shows the handoff. These cards explain what it prevents.
            </p>

            {automationCards.map((card) => {
              const Icon = card.icon;
              const isActive = activeFeature === card.id;

              return (
                <article
                  className={
                    isActive
                      ? "automation-card is-active"
                      : "automation-card"
                  }
                  key={card.id}
                  onMouseEnter={() => setActiveFeature(card.id)}
                  onMouseLeave={() => setActiveFeature(null)}
                  onFocus={() => setActiveFeature(card.id)}
                  onBlur={() => setActiveFeature(null)}
                  tabIndex={0}
                >
                  <span className="automation-card__icon">
                    <Icon size={20} aria-hidden="true" />
                  </span>

                  <div>
                    <h3>{card.title}</h3>
                    <p>{card.summary}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}


function CapabilitiesSection() {
  const [focusedMethodologyStep, setFocusedMethodologyStep] = useState(null);

  function handleCapabilityGridMouseMove(event) {
    const grid = event.currentTarget;
    const rect = grid.getBoundingClientRect();

    grid.style.setProperty("--x", `${event.clientX - rect.left}px`);
    grid.style.setProperty("--y", `${event.clientY - rect.top}px`);
  }

  function handleCapabilityGridMouseLeave(event) {
    const grid = event.currentTarget;

    grid.style.setProperty("--x", "50%");
    grid.style.setProperty("--y", "50%");
  }

  return (
    <section
      className="capabilities-section"
      id="capabilities"
      aria-labelledby="capabilities-title"
    >
      <div className="capabilities-shell">
        <div className="capabilities-layout capabilities-layout--sticky">
          <div className="capabilities-sticky-column">
            <aside className="capability-sticky">
              <p className="section-kicker">Capabilities & Methodology</p>

              <h2 id="capabilities-title">How I build & what I deliver.</h2>

              <p>
                A tighter delivery system for conversion focused pages: plan the
                buying path, build the right platform experience, then QA the
                details that affect trust, speed, and lead flow.
              </p>

              <div
                className="capability-proof-grid"
                aria-label="Delivery strengths"
              >
                {capabilityProofs.map((proof) => (
                  <span className="capability-proof" key={proof}>
                    <CheckCircle2 size={16} aria-hidden="true" />
                    {proof}
                  </span>
                ))}
              </div>

              <MagneticCTA
                className="btn btn--primary"
                href="#contact"
                strength={12}
              >
                <Mail size={18} aria-hidden="true" />
                Start a conversion build
              </MagneticCTA>
            </aside>
          </div>

          <div className="capabilities-scroll">
            <div className="capability-group">
              <div className="capability-group__label">
                <span>01</span>
                <strong>What I deliver</strong>
              </div>

              <div
                className="capability-grid capability-grid--spotlight"
                onMouseMove={handleCapabilityGridMouseMove}
                onMouseLeave={handleCapabilityGridMouseLeave}
              >
                {capabilityCards.map((capability) => {
                  const Icon = capability.icon;

                  return (
                    <article
                      className="capability-card capability-card--spotlight"
                      key={capability.title}
                    >
                      <div className="capability-card__top">
                        <span className="capability-card__icon">
                          <Icon size={20} aria-hidden="true" />
                        </span>

                        <ArrowUpRight size={17} aria-hidden="true" />
                      </div>

                      <h3>{capability.title}</h3>

                      <p>{capability.summary}</p>

                      <div
                        className="capability-chip-row"
                        aria-label={`${capability.title} focus areas`}
                      >
                        {capability.chips.map((chip) => (
                          <span key={`${capability.title}-${chip}`}>
                            {chip}
                          </span>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="methodology-panel">
              <div className="capability-group__label">
                <span>02</span>
                <strong>Launch methodology</strong>
              </div>

              <div
                className={
                  focusedMethodologyStep
                    ? "methodology-flow methodology-flow--focused"
                    : "methodology-flow"
                }
                onMouseLeave={() => setFocusedMethodologyStep(null)}
              >
                {methodologyCards.map((step, index) => {
                  const Icon = step.icon;
                  const isFocused = focusedMethodologyStep === step.phase;
                  const isDimmed = focusedMethodologyStep && !isFocused;

                  return (
                    <article
                      className={[
                        "methodology-card",
                        isFocused ? "is-focused" : "",
                        isDimmed ? "is-dimmed" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      key={step.phase}
                      tabIndex={0}
                      onMouseEnter={() => setFocusedMethodologyStep(step.phase)}
                      onFocus={() => setFocusedMethodologyStep(step.phase)}
                      onBlur={() => setFocusedMethodologyStep(null)}
                    >
                      <span className="methodology-card__number">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="methodology-card__icon">
                        <Icon size={20} aria-hidden="true" />
                      </span>

                      <div>
                        <h3>{step.phase}</h3>
                        <p>{step.summary}</p>
                        <strong>{step.output}</strong>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function App() {
  const [activeWorkFilter, setActiveWorkFilter] = useState(ALL_WORK_FILTER);
  const [renderedWorkFilter, setRenderedWorkFilter] = useState(ALL_WORK_FILTER);
  const [workGridPhase, setWorkGridPhase] = useState("is-ready");
  const [visibleWorkCount, setVisibleWorkCount] = useState(WORK_PAGE_SIZE);
  const [contactForm, setContactForm] = useState(initialContactForm);
  const [selectedProjectType, setSelectedProjectType] = useState(
    initialContactForm.projectType,
  );
  const [contactTouched, setContactTouched] = useState({});
  const [contactErrors, setContactErrors] = useState({});
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactStatus, setContactStatus] = useState({ type: "", message: "" });
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [emailCopied, setEmailCopied] = useState(false);
  const [selectedCaseStudyId, setSelectedCaseStudyId] = useState(null);
  const [selectedAutomationModalId, setSelectedAutomationModalId] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const workFilterTimers = useRef([]);
  const workSectionRef = useRef(null);
  const captchaRef = useRef(null);

  const selectedWorkEntries = useMemo(
    () =>
      projects
        .slice()
        .sort(
          (a, b) =>
            Number.parseInt(a.number, 10) - Number.parseInt(b.number, 10),
        ),
    [],
  );

  function getWorkFilterCount(filterName) {
    if (filterName === ALL_WORK_FILTER) {
      return selectedWorkEntries.length;
    }

    return selectedWorkEntries.filter(
      (project) => project.category === filterName,
    ).length;
  }

  const selectedWorkProjects = useMemo(
    () =>
      renderedWorkFilter === ALL_WORK_FILTER
        ? selectedWorkEntries
        : selectedWorkEntries.filter(
            (project) => project.category === renderedWorkFilter,
          ),
    [renderedWorkFilter, selectedWorkEntries],
  );
  const visibleWorkProjects = useMemo(
    () => selectedWorkProjects.slice(0, visibleWorkCount),
    [selectedWorkProjects, visibleWorkCount],
  );
  const hasMoreWork = visibleWorkCount < selectedWorkProjects.length;
  const canToggleWorkCount = selectedWorkProjects.length > WORK_PAGE_SIZE;
  const visibleWorkTotal = Math.min(
    visibleWorkCount,
    selectedWorkProjects.length,
  );
  const isAutomationWorkFilter = renderedWorkFilter === "Automations";

  const selectedCaseStudyProject = useMemo(
    () =>
      projects.find((project) => project.id === selectedCaseStudyId) ?? null,
    [selectedCaseStudyId],
  );

  const selectedAutomationModalProject = useMemo(
    () =>
      projects.find((project) => project.id === selectedAutomationModalId) ?? null,
    [selectedAutomationModalId],
  );

  useEffect(() => {
    const originalTitle =
      document.title || "John Michael Bonganay | Conversion Front End Developer & Workflow Automation Specialist";

    function handleVisibilityChange() {
      document.title = document.hidden
        ? "👋 Don't lose those conversions!"
        : originalTitle;
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.title = originalTitle;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
  function clearWorkFilterTimers() {
    workFilterTimers.current.forEach((timer) => window.clearTimeout(timer));
    workFilterTimers.current = [];
  }

  useEffect(() => {
    const sectionWrappers = document.querySelectorAll(
      [
        ".featured-work",
        ".hire-confidence-section",
        ".faq-section",
        ".automation-section",
        ".contact-section",
        ".site-footer",
      ].join(", "),
    );

    sectionWrappers.forEach((section) => {
      section.classList.remove("reveal-item");
      section.classList.add("is-visible");
      section.style.removeProperty("--reveal-delay");
    });

    const animatedItems = document.querySelectorAll(
      [
        ".project-card",
        ".contact-card",
        ".contact-form",
        ".work-proof-row",
        ".hire-confidence-lead-card",
        ".hire-confidence-card",
        ".hire-confidence-footer",
        ".faq-item",
        ".automation-map",
        ".automation-card",
      ].join(", "),
    );

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      animatedItems.forEach((item) => item.classList.add("is-visible"));
      return undefined;
    }

    const delayResetTimers = [];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");

            const revealDelay =
              Number.parseInt(
                entry.target.style.getPropertyValue("--reveal-delay"),
                10,
              ) || 0;

            delayResetTimers.push(
              window.setTimeout(() => {
                entry.target.style.setProperty("--reveal-delay", "0ms");
              }, revealDelay + 700),
            );

            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px 120px 0px",
        threshold: 0.01,
      },
    );

    animatedItems.forEach((item, index) => {
      item.classList.add("reveal-item");

      if (!item.style.getPropertyValue("--reveal-delay")) {
        item.style.setProperty(
          "--reveal-delay",
          `${Math.min(index % 8, 5) * 55}ms`,
        );
      }

      observer.observe(item);
    });

    return () => {
      observer.disconnect();
      delayResetTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [renderedWorkFilter, visibleWorkProjects.length, workGridPhase]);

  useEffect(() => () => clearWorkFilterTimers(), []);

  useEffect(() => {
    if (!selectedCaseStudyProject) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setSelectedCaseStudyId(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedCaseStudyProject]);

  function handleWorkFilterChange(filterId) {
    if (filterId === activeWorkFilter) {
      return;
    }

    clearWorkFilterTimers();
    setActiveWorkFilter(filterId);
    setVisibleWorkCount(WORK_PAGE_SIZE);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRenderedWorkFilter(filterId);
      setWorkGridPhase("is-ready");
      return;
    }

    setWorkGridPhase("is-leaving");

    const exitTimer = window.setTimeout(() => {
      setRenderedWorkFilter(filterId);
      setWorkGridPhase("is-entering");

      const enterTimer = window.setTimeout(() => {
        setWorkGridPhase("is-ready");
      }, 45);

      workFilterTimers.current.push(enterTimer);
    }, 180);

    workFilterTimers.current.push(exitTimer);
  }


  function handleNavClick(event, href) {
    event.preventDefault();
    setIsMobileMenuOpen(false);

    const targetSection = document.querySelector(href);

    if (targetSection) {
      targetSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      window.history.pushState(null, "", href);
    }
  }

  function handleHeroPlatformClick(filterId) {
    handleWorkFilterChange(filterId);

    window.requestAnimationFrame(() => {
      workSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function handleWorkVisibilityToggle() {
    if (hasMoreWork) {
      setVisibleWorkCount((currentCount) =>
        Math.min(currentCount + WORK_PAGE_SIZE, selectedWorkProjects.length),
      );

      return;
    }

    setVisibleWorkCount(WORK_PAGE_SIZE);

    window.requestAnimationFrame(() => {
      workSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function handleContactChange(event) {
    const { name, value } = event.target;
    const nextForm = {
      ...contactForm,
      [name]: value,
    };

    setContactForm(nextForm);
    setContactStatus({ type: "", message: "" });
    if (captchaError) {
      setCaptchaError("");
    }

    if (contactTouched[name]) {
      setContactErrors(validateContactForm(nextForm, selectedProjectType));
    }
  }

  function handleContactBlur(event) {
    const { name } = event.target;
    setContactTouched((current) => ({
      ...current,
      [name]: true,
    }));
    setContactErrors(validateContactForm(contactForm, selectedProjectType));
  }

  function handleProjectTypeSelect(type) {
    const nextProjectType = selectedProjectType === type ? "" : type;

    setSelectedProjectType(nextProjectType);
    setContactStatus({ type: "", message: "" });
    setContactTouched((current) => ({
      ...current,
      projectType: true,
    }));
    setContactErrors(validateContactForm(contactForm, nextProjectType));
  }

  async function handleCopyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setEmailCopied(true);

      window.setTimeout(() => {
        setEmailCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Email copy failed:", error);
      window.location.href = `mailto:${profile.email}`;
    }
  }

  async function handleContactSubmit(event) {
    event.preventDefault();

    const nextErrors = validateContactForm(contactForm, selectedProjectType);
    const isContactIntegrationReady = Boolean(WEB3FORMS_ACCESS_KEY && HCAPTCHA_SITE_KEY);
    setContactTouched({
      name: true,
      email: true,
      message: true,
    });
    setContactErrors(nextErrors);

    if (!isContactIntegrationReady) {
      setContactStatus({
        type: "error",
        message:
          "Contact form security keys are not configured. Please add the Vercel environment variables first.",
      });
      return;
    }

    if (Object.keys(nextErrors).length > 0) {
      setContactStatus({
        type: "error",
        message: "Please complete the required fields before sending.",
      });
      return;
    }

    if (!captchaToken) {
      setCaptchaError("Please complete the captcha before sending.");
      setContactStatus({ type: "", message: "" });
      return;
    }

    setCaptchaError("");
    setContactSubmitting(true);
    setContactStatus({ type: "", message: "" });

    try {
      const formData = new FormData(event.currentTarget);

      formData.set("access_key", WEB3FORMS_ACCESS_KEY);
      formData.set("project_type", selectedProjectType || "Not selected");
      formData.set(
        "subject",
        `New portfolio inquiry${selectedProjectType ? ` | ${selectedProjectType}` : ""}`,
      );
      formData.set("from_name", "John Michael Portfolio");
      formData.set("h-captcha-response", captchaToken);

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error("Web3Forms submission failed:", {
          status: response.status,
          ok: response.ok,
          response: data,
        });

        setContactStatus({
          type: "error",
          message:
            data.message ||
            "Something went wrong while sending your inquiry. Please try again.",
        });
        setCaptchaToken("");
        captchaRef.current?.resetCaptcha();
        return;
      }

      void fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          message: contactForm.message,
          projectIdea: contactForm.message,
          projectType: selectedProjectType || "Not selected",
          submissionType: "ai_scoper",
        }),
      }).catch((makeError) => {
        console.warn("Make.com webhook failed:", makeError);
      });

      ReactGA.event({
        category: "Form",
        action: "Submitted Contact Form",
        label: "Quick Inquiry",
      });

      ReactGA.event("generate_lead", {
        form_name: "Quick Inquiry",
        source: "Portfolio Contact Form",
      });

      setContactForm(initialContactForm);
      setSelectedProjectType(initialContactForm.projectType);
      setContactTouched({});
      setContactErrors({});
      setCaptchaToken("");
      setCaptchaError("");
      captchaRef.current?.resetCaptcha();
      setContactStatus({
        type: "success",
        message: "Inquiry sent successfully. I will be in touch within 24 hours.",
      });
    } catch (error) {
      console.error("Web3Forms network error:", error);

      setContactStatus({
        type: "error",
        message: "Unable to send right now. Please try again in a moment.",
      });
      setCaptchaToken("");
      captchaRef.current?.resetCaptcha();
    } finally {
      setContactSubmitting(false);
    }
  }

  function getContactFieldState(fieldName) {
    if (contactErrors[fieldName] && contactTouched[fieldName]) {
      return "is-invalid";
    }

    const fieldValue =
      fieldName === "projectType" ? selectedProjectType : contactForm[fieldName];

    if (
      contactTouched[fieldName] &&
      String(fieldValue).trim() &&
      !contactErrors[fieldName]
    ) {
      return "is-valid";
    }

    return "";
  }

  const contactSucceeded = contactStatus.type === "success";
  const isCaptchaReady = Boolean(captchaToken);
  const isContactIntegrationReady = Boolean(WEB3FORMS_ACCESS_KEY && HCAPTCHA_SITE_KEY);
  const contactSubmitDisabled = contactSubmitting || !isContactIntegrationReady;

  return (
    <main className="portfolio-shell">
      <NoiseOverlay />
      <section className="hero" aria-labelledby="hero-title">
        <img
          className="hero__image"
          src={heroImage}
          alt=""
          width="1500"
          height="844"
          aria-hidden="true"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
        <div className="hero__overlay" />
        <div className="hero__grain" />

        <header className="site-nav site-nav--responsive" aria-label="Primary navigation">
          <a
            className="brand"
            href="#top"
            onClick={(event) => handleNavClick(event, "#top")}
            aria-label="John Michael Bonganay home"
          >
            <span>JM</span>
            <strong>Bonganay</strong>
          </a>

          <nav className="nav-links" aria-label="Desktop navigation">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(event) => handleNavClick(event, link.href)}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <button
            className="site-nav__menu-button"
            type="button"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            aria-label={
              isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMobileMenuOpen ? (
              <X size={22} aria-hidden="true" />
            ) : (
              <Menu size={22} aria-hidden="true" />
            )}
          </button>

          {isMobileMenuOpen ? (
            <nav
              className="site-nav__mobile-menu"
              id="mobile-navigation"
              aria-label="Mobile navigation"
            >
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(event) => handleNavClick(event, link.href)}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          ) : null}
        </header>

        <div
          className="hero__content hero__content--mobile-optimized hero__content--portrait"
          id="top"
        >
          <div className="hero__copy">
            <p className="eyebrow hero__role-badge hero-animate hero-animate--badge">
              <span className="status-dot" aria-hidden="true" />
              {profile.role}
            </p>

            <h1 id="hero-title" className="hero-animate hero-animate--title">
              {profile.headline}
            </h1>

            <div className="hero-animate hero-animate--subtext">
              <p className="hero__summary">{profile.summary}</p>

              <div className="hero__value-grid" aria-label="Hybrid conversion and backend systems value">
                {profile.heroBullets.map((bullet) => (
                  <div className="hero__value-item" key={bullet.label}>
                    <strong>{bullet.label}</strong>
                    <span>{bullet.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="hero__actions hero-animate hero-animate--actions"
              aria-label="Primary actions"
            >
              <MagneticCTA
                className="btn btn--primary hero__primary-cta"
                href="#contact"
                strength={12}
                onClick={() => {
                  ReactGA.event({
                    category: "User",
                    action: "Clicked Hero CTA",
                    label: "Contact Inquiry",
                  });
                }}
              >
                <Mail className="hero__primary-cta-icon" size={18} aria-hidden="true" />
                Start a quick inquiry
              </MagneticCTA>

              <a className="btn btn--secondary" href="#work">
                <ArrowUpRight size={18} aria-hidden="true" />
                Review selected work
              </a>
            </div>


            <div
              className="hero__meta hero-animate hero-animate--meta"
              aria-label="Location, availability, and local time"
            >
              <span>
                <MapPin size={16} aria-hidden="true" />
                {profile.location}
              </span>

              <span className="hero__availability">
                <span className="availability-beacon" aria-hidden="true" />
                Available for remote roles and projects
              </span>

              <LocalPhtClock />
            </div>
          </div>

          <aside
            className="hero-portrait hero-animate hero-animate--portrait"
            aria-label="Professional portrait of John Michael Bonganay"
          >
            <div className="hero-portrait__frame">
              <span className="hero-portrait__glow hero-portrait__glow--one" aria-hidden="true" />
              <span className="hero-portrait__glow hero-portrait__glow--two" aria-hidden="true" />

              <div className="hero-portrait__image-wrap">
                <img
                  src={johnMichaelPortrait}
                  alt="John Michael Bonganay, landing page developer and automation specialist"
                  className="hero-portrait__image"
                  width="900"
                  height="1125"
                  loading="eager"
                  decoding="async"
                />
              </div>

              <div className="hero-portrait__caption">
                <div>
                  <span>Landing pages + automation systems</span>

                  <div
                    className="hero-portrait__tags"
                    aria-label="Filter selected works by platform or skill category"
                  >
                    {heroPlatformTags.map((tag) => (
                      <button
                        key={tag.filterId}
                        type="button"
                        className="hero-portrait__tag"
                        onClick={() => handleHeroPlatformClick(tag.filterId)}
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>

                <a
                  className="hero-portrait__link"
                  href="https://www.onlinejobs.ph/jobseekers/info/1517849"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View resume profile
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
          </aside>
        </div>

        <div className="proof-grid" aria-label="Profile highlights">
          {profile.stats.map((stat) => (
            <div className="proof-item" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section
        className="tech-marquee"
        aria-label="Core front end and marketing tools"
      >
        <div className="tech-marquee__viewport">
          <div className="tech-marquee__track">
            {Array.from({ length: 6 }).map((_, groupIndex) => (
              <ul
                className="tech-marquee__group"
                key={`tools-loop-${groupIndex}`}
                aria-hidden={groupIndex > 0}
              >
                {techStackItems.map((tool) => (
                  <li className="tech-chip" key={`${groupIndex}-${tool.name}`}>
                    <span>{tool.mark}</span>
                    <strong>{tool.name}</strong>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </section>

      <section
        className="featured-work"
        id="work"
        aria-labelledby="work-title"
        ref={workSectionRef}
      >
        <div className="work-shell">
          <div className="work-heading">
            <p className="section-kicker">Selected Works</p>
            <div>
              <h2 id="work-title">
                Selected builds that show the front end and the systems behind it.
              </h2>
              <p>
                A focused set of Shopify, WordPress, Netlify, GoHighLevel, and
                automation projects showing what I designed, built, optimized,
                routed, or launched.
              </p>
            </div>
          </div>

          <p className="work-filter-note">Featured case studies first. Browse by platform.</p>

          <div className="work-controls-shell work-controls-shell--fade">
            <div className="work-controls" aria-label="Filter selected works by platform or skill category">
              {workFilters.map((filter) => {
                const isActive = activeWorkFilter === filter;

                return (
                  <button
                    className={isActive ? "work-filter is-active" : "work-filter"}
                    type="button"
                    key={filter}
                    onClick={() => handleWorkFilterChange(filter)}
                    aria-pressed={isActive}
                  >
                    <span>{filter}</span>
                    <strong>{getWorkFilterCount(filter)}</strong>
                  </button>
                );
              })}
            </div>
          </div>

          {isAutomationWorkFilter ? (
            <StaggeredGrid
              key={`automation-grid-${renderedWorkFilter}-${visibleWorkProjects.length}`}
              className={`automation-work-grid ${workGridPhase}`}
              id="selected-work-grid"
              aria-live="polite"
            >
              {visibleWorkProjects.map((project, index) => (
                <StaggeredGridItem key={`${renderedWorkFilter}-${project.id}`} className="motion-work-item">
                  <HoverCard className="motion-work-hover">
                    <GHLAutomationCard
                      project={project}
                      onViewMetrics={setSelectedAutomationModalId}
                    />
                  </HoverCard>
                </StaggeredGridItem>
              ))}
            </StaggeredGrid>
          ) : (
            <StaggeredGrid
              key={`work-grid-${renderedWorkFilter}-${visibleWorkProjects.length}`}
              className={`work-grid ${workGridPhase}`}
              id="selected-work-grid"
              aria-live="polite"
            >
              {visibleWorkProjects.map((project, index) => (
                <StaggeredGridItem key={`${renderedWorkFilter}-${project.id}`} className="motion-work-item">
                  <HoverCard className="motion-work-hover">
                    {project.category === "Automations" ? (
                      <GHLAutomationCard
                        project={project}
                        onViewMetrics={setSelectedAutomationModalId}
                      />
                    ) : (
                      <ProjectCard
                        project={project}
                        index={index}
                        onOpenCaseStudy={setSelectedCaseStudyId}
                      />
                    )}
                  </HoverCard>
                </StaggeredGridItem>
              ))}
            </StaggeredGrid>
          )}

          {canToggleWorkCount ? (
            <div className="work-more" aria-label="Selected works pagination">
              <p className="work-more__count">
                Showing <strong>{visibleWorkTotal}</strong> of{" "}
                <strong>{selectedWorkProjects.length}</strong> projects
              </p>

              <button
                className={
                  hasMoreWork
                    ? "show-work-toggle"
                    : "show-work-toggle is-expanded"
                }
                type="button"
                onClick={handleWorkVisibilityToggle}
                aria-controls="selected-work-grid"
                aria-expanded={!hasMoreWork}
              >
                <span>{hasMoreWork ? "Show more work" : "Show less"}</span>
                <ArrowUpRight size={17} aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <HireConfidenceSection />

      <Suspense fallback={<SectionFallback />}>
        <TechMatrix />
      </Suspense>

      <AutomationSection />


      <RoleFitSection />

      <FAQSection />

      <section
        className="contact-section"
        id="contact"
        aria-labelledby="contact-title"
      >
        <div className="contact-shell">
          <div className="contact-card">
            <div className="contact-cta">
              <p className="section-kicker">Contact</p>

              <h2 id="contact-title">Discuss a role, project, or automation build.</h2>

              <p>
                Share a brief overview of what you need. I will review it
                personally and reply with the best next step.
              </p>

              <div className="contact-secondary">
                <p>Prefer direct contact?</p>

                <div className="contact-direct" aria-label="Direct contact links">
                  <button
                    className={
                      emailCopied
                        ? "contact-copy-card is-copied"
                        : "contact-copy-card"
                    }
                    type="button"
                    onClick={handleCopyEmail}
                    aria-label={`Copy email address ${profile.email}`}
                  >
                    {emailCopied ? (
                      <CheckCircle2 size={18} aria-hidden="true" />
                    ) : (
                      <Mail size={18} aria-hidden="true" />
                    )}

                    <span>
                      <small>Email</small>
                      <strong>{profile.email}</strong>
                    </span>

                    <em>{emailCopied ? "Copied" : "Copy"}</em>
                  </button>

                  <a href={profile.linkedin} target="_blank" rel="noreferrer">
                    <ExternalLink size={18} aria-hidden="true" />
                    <span>
                      <small>LinkedIn</small>
                      <strong>Connect on LinkedIn</strong>
                    </span>
                  </a>
                </div>
              </div>

              <div className="contact-availability">
                <div className="contact-availability__main">
                  <CalendarClock size={18} aria-hidden="true" />
                  <p>
                    <strong>Available for freelance projects and remote roles.</strong>
                    <span>Organized, responsive, and ready for async collaboration.</span>
                  </p>
                </div>

                <div
                  className="trust-signal-grid"
                  aria-label="Availability and remote work signals"
                >
                  {contactTrustSignals.map((signal) => (
                    <span key={signal}>
                      <CheckCircle2 size={14} aria-hidden="true" />
                      {signal}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <form
              className={
                contactSucceeded
                  ? "contact-form contact-form--success"
                  : "contact-form"
              }
              noValidate
              onSubmit={handleContactSubmit}
            >
              {contactSucceeded ? (
                <div
                  className="contact-success-morph"
                  role="status"
                  aria-live="polite"
                >
                  <div className="contact-success-morph__icon">
                    <CheckCircle2 size={34} aria-hidden="true" />
                  </div>

                  <span>Message received</span>

                  <h3>Inquiry sent successfully.</h3>

                  <p>I will be in touch within 24 hours.</p>

                  <button
                    className="contact-success-morph__button"
                    type="button"
                    onClick={() => setContactStatus({ type: "", message: "" })}
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="checkbox"
                    name="botcheck"
                    className="hidden"
                    tabIndex="-1"
                    autoComplete="off"
                    aria-hidden="true"
                  />

                  <div className="contact-form__top">
                    <div className="contact-form__eyebrow">
                      <span className="status-dot" aria-hidden="true" />
                      <p>Quick inquiry</p>
                    </div>

                    <h3>Send the details here</h3>
                    <small>Use 2 to 3 sentences. I will reply with the next step.</small>
                  </div>

                  <div className={`form-field ${getContactFieldState("name")}`}>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder=" "
                      value={contactForm.name}
                      onChange={handleContactChange}
                      onBlur={handleContactBlur}
                      aria-invalid={Boolean(
                        contactErrors.name && contactTouched.name,
                      )}
                      aria-describedby={
                        contactErrors.name && contactTouched.name
                          ? "contact-name-error"
                          : undefined
                      }
                      required
                    />
                    <label htmlFor="contact-name">Name</label>

                    {contactErrors.name && contactTouched.name ? (
                      <small id="contact-name-error">{contactErrors.name}</small>
                    ) : null}
                  </div>

                  <div className={`form-field ${getContactFieldState("email")}`}>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder=" "
                      value={contactForm.email}
                      onChange={handleContactChange}
                      onBlur={handleContactBlur}
                      aria-invalid={Boolean(
                        contactErrors.email && contactTouched.email,
                      )}
                      aria-describedby={
                        contactErrors.email && contactTouched.email
                          ? "contact-email-error"
                          : undefined
                      }
                      required
                    />
                    <label htmlFor="contact-email">Email address</label>

                    {contactErrors.email && contactTouched.email ? (
                      <small id="contact-email-error">{contactErrors.email}</small>
                    ) : null}
                  </div>

                  <div
                    className={`project-type-field ${
                      selectedProjectType ? "is-valid" : ""
                    }`}
                    aria-labelledby="contact-project-type-label"
                  >
                    <div className="project-type-label-row">
                      <span id="contact-project-type-label">Inquiry type</span>
                      <small>Optional</small>
                    </div>

                    <div className="project-type-grid">
                      {contactProjectTypes.map((type) => {
                        const isSelected = selectedProjectType === type;

                        return (
                          <button
                            className={
                              isSelected
                                ? "project-type-option is-selected"
                                : "project-type-option"
                            }
                            type="button"
                            aria-pressed={isSelected}
                            key={type}
                            onClick={() => handleProjectTypeSelect(type)}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div
                    className={`form-field form-field--textarea ${getContactFieldState(
                      "message",
                    )}`}
                  >
                    <textarea
                      id="contact-message"
                      name="message"
                      rows="5"
                      placeholder=" "
                      value={contactForm.message}
                      onChange={handleContactChange}
                      onBlur={handleContactBlur}
                      aria-invalid={Boolean(
                        contactErrors.message && contactTouched.message,
                      )}
                      aria-describedby={
                        contactErrors.message && contactTouched.message
                          ? "contact-message-error"
                          : undefined
                      }
                      required
                    />
                    <label htmlFor="contact-message">What do you need help with?</label>

                    {contactErrors.message && contactTouched.message ? (
                      <small id="contact-message-error">
                        {contactErrors.message}
                      </small>
                    ) : null}
                  </div>

                  <div className="contact-captcha">
                    {HCAPTCHA_SITE_KEY ? (
                      <HCaptcha
                        ref={captchaRef}
                        sitekey={HCAPTCHA_SITE_KEY}
                        reCaptchaCompat={false}
                        theme="dark"
                        onVerify={(token) => {
                          setCaptchaToken(token);
                          setCaptchaError("");
                          setContactStatus((currentStatus) => {
                            if (
                              currentStatus.type === "error" &&
                              /captcha|hcaptcha/i.test(currentStatus.message)
                            ) {
                              return { type: "", message: "" };
                            }

                            return currentStatus;
                          });
                        }}
                        onExpire={() => {
                          setCaptchaToken("");
                          setCaptchaError("Captcha expired. Please verify again.");
                        }}
                        onError={() => {
                          setCaptchaToken("");
                          setCaptchaError("Captcha failed to load. Please try again.");
                        }}
                      />
                    ) : (
                      <small className="contact-captcha__error" role="alert">
                        hCaptcha site key is missing. Add VITE_HCAPTCHA_SITE_KEY in Vercel or .env.local.
                      </small>
                    )}

                    <input
                      type="hidden"
                      name="h-captcha-response"
                      value={captchaToken}
                      readOnly
                    />

                    {captchaError ? (
                      <small className="contact-captcha__error" role="alert">
                        {captchaError}
                      </small>
                    ) : null}
                  </div>

                  <button
                    className="submit-button"
                    type="submit"
                    disabled={contactSubmitDisabled}
                    aria-disabled={contactSubmitDisabled}
                    title={
                      !isContactIntegrationReady
                        ? "Add Vercel environment variables first"
                        : undefined
                    }
                  >
                    <span>
                      {contactSubmitting
                        ? "Sending..."
                        : !isContactIntegrationReady
                          ? "Contact form not configured"
                          : "Send inquiry"}
                    </span>
                    <Send size={18} aria-hidden="true" />
                  </button>

                  {contactStatus.message && contactStatus.type === "error" ? (
                    <div
                      className="form-success form-success--error is-visible"
                      role="status"
                      aria-live="polite"
                    >
                      <CheckCircle2 size={18} aria-hidden="true" />
                      <span>{contactStatus.message}</span>
                    </div>
                  ) : null}
                </>
              )}
            </form>
          </div>
        </div>
      </section>
      <footer className="site-footer" aria-label="Portfolio footer">
        <div className="footer-shell">
          <div className="footer-brand">
            <a className="brand" href="#top" aria-label="Back to top">
              <span>JM</span>
              <strong>Bonganay</strong>
            </a>
            <p>
              Conversion focused front end work with clean handoffs and practical
              automation systems that keep campaigns moving.
            </p>
            <StatusWidget />
          </div>

          <div className="footer-action-panel" aria-label="Quick contact links">
            <p>Available for freelance projects and remote roles.</p>
            <div className="footer-actions">
              <a href={`mailto:${profile.email}`}>
                Email me
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>
          </div>

          <p className="footer-copy">
            © {new Date().getFullYear()} John Michael Bonganay. Designed and built
            with React.
          </p>
        </div>
      </footer>

      <ScrollToTop />

      <AutomationModal
        project={selectedAutomationModalProject}
        isOpen={Boolean(selectedAutomationModalProject)}
        onClose={() => setSelectedAutomationModalId(null)}
      />

      <CaseStudyDrawer
        project={selectedCaseStudyProject}
        onClose={() => setSelectedCaseStudyId(null)}
      />
    </main>
  );
}

export default App;
