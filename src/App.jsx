import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import ReactGA from "react-ga4";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import {
  ArrowUp,
  ArrowUpRight,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  Code2,
  ExternalLink,
  FileText,
  Gauge,
  Lock,
  Mail,
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
import PrivacyConsent from "./components/PrivacyConsent";
import StatusWidget from "./components/StatusWidget";
import { HoverCard, StaggeredGrid, StaggeredGridItem } from "./components/MotionWrappers";
import { profile } from "./data/profile";
import { projects } from "./data/projects";
import { imageDimensions } from "./data/imageDimensions";
import {
  contactCopy,
  contactProjectTypes,
  contactTrustSignals,
  getFirstInvalidContactField,
} from "./data/contact";
import { readAnalyticsConsent } from "./privacy/analytics-consent";


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
  { name: "Analytics", mark: "GA" },
  { name: "API Integrations", mark: "API" },
  { name: "n8n", mark: "n8n" },
];
const WORK_PAGE_SIZE = 5;
const COMPACT_WORK_PAGE_SIZE = 4;
// Public client identifiers are loaded from environment variables so they can
// be rotated without source-code edits.
const HCAPTCHA_SITE_KEY = import.meta.env.VITE_HCAPTCHA_SITE_KEY || "";
const AUTOMATION_LEAD_ENDPOINT = "/api/automation-lead";
const MAX_CONTACT_NAME_LENGTH = 160;
const MAX_CONTACT_EMAIL_LENGTH = 240;
const MAX_CONTACT_MESSAGE_LENGTH = 3000;

function sendAnalyticsEvent(...args) {
  if (
    typeof window !== "undefined" &&
    readAnalyticsConsent(window.localStorage) === "granted"
  ) {
    ReactGA.event(...args);
  }
}

const ALL_WORK_FILTER = "featured";
const WORK_ARCHIVE_FILTER = "all";

const featuredWorkIds = [
  "barkchester-united",
  "vista-veil",
  "wordpress-woocommerce-30m",
  "nest-marketing",
  "ghl-production-automations",
];

const automationSpotlightIds = [
  "automation-inbound-triage-crm",
  "ghl-production-automations",
];

const workFilters = [
  {
    id: "featured",
    label: "Featured",
    description: "A curated mix of the strongest proof, polish, and platform range.",
  },
  {
    id: "ecommerce",
    label: "Ecommerce",
    description: "Shopify product pages and DTC storefront work built around purchase clarity.",
  },
  {
    id: "landing",
    label: "Landing pages",
    description: "WordPress, Netlify, and advertorial pages shaped for campaign traffic.",
  },
  {
    id: "automation",
    label: "CRM & automation",
    description: "GoHighLevel workflows, lead routing, and backend automation systems.",
  },
];

const workProofHighlights = [
  { value: "$52.9K", label: "top Shopify sales proof" },
  { value: "1,229", label: "orders from one build" },
  { value: "689+", label: "production leads routed" },
];

function getProjectBadges(project) {
  return [project.category, project.type].filter(Boolean).slice(0, 3);
}

function getSafeExternalHref(value) {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function getSafeHostname(value, fallback = "Case study preview") {
  const safeHref = getSafeExternalHref(value);

  if (!safeHref) {
    return fallback;
  }

  return new URL(safeHref).hostname.replace("www.", "");
}

const navLinks = [
  { label: "Work", href: "#work" },
  { label: "Stack", href: "#stack" },
  { label: "Automation", href: "#automation" },
  { label: "Role Fit", href: "#role-fit" },
  { label: "Contact", href: "#contact" },
];

const footerLinks = [
  { label: "Selected work", href: "#work" },
  { label: "Automation", href: "#automation" },
  { label: "Engineered stack", href: "#stack" },
  { label: "Role fit", href: "#role-fit" },
  { label: "Resume", href: profile.resumePath, download: "JohnMichael_Bonganay_Resume.pdf" },
];

const selectedWorkMeta = {
  "barkchester-united": {
    eyebrow: "Flagship Shopify case study",
    title: "Barkchester United Shopify Product Page",
    summary:
      "A pet product page rebuilt around emotional offer framing, review proof, benefit hierarchy, and a cleaner purchase path.",
    role: "Built Shopify product page, improved offer layout, handled responsive QA.",
    outcome: "$52.9K total sales, 1,229 orders, and a 4.82% conversion rate.",
    metrics: [
      { value: "$52.9K", label: "Total sales" },
      { value: "1,229", label: "Orders" },
      { value: "4.82%", label: "Conversion" },
    ],
    tags: ["Shopify", "Conversion build", "Sales proof"],
  },
  "vista-veil": {
    eyebrow: "Beauty ecommerce",
    title: "VistaVeil Beauty Tech Product Page",
    summary:
      "A polished beauty tech offer page with product education, pricing contrast, review proof, and a smoother bundle decision flow.",
    role: "Built Shopify offer page, shaped product story, handled responsive QA.",
    outcome: "$28.7K sales proof across a live Shopify campaign.",
    metrics: [
      { value: "$28.7K", label: "Total sales" },
      { value: "323", label: "Orders" },
    ],
    tags: ["Shopify", "Beauty tech"],
  },
  "grippit-strength": {
    eyebrow: "Health product offer",
    title: "Health Product Shopify Sales Page",
    summary:
      "A direct response Shopify page that explains the use case quickly, supports buyer confidence, and keeps bundle cards easy to compare.",
    role: "Shopify build, offer layout, responsive product QA",
    outcome: "$7,992 total sales with a 3.91% conversion rate.",
    metrics: [
      { value: "$7,992", label: "Total sales" },
      { value: "3.91%", label: "Conversion" },
    ],
    tags: ["Shopify", "Health product"],
  },
  "purely-nutrient": {
    eyebrow: "Supplement ecommerce",
    title: "Purely Nutrient Black Seed Oil Page",
    summary:
      "A supplement page structured around trust cues, warning messaging, product education, review proof, and bundle purchase cards.",
    role: "Shopify product page build, supplement offer layout, responsive QA.",
    outcome: "Clear supplement positioning with trust led product education and bundle purchase flow.",
    metrics: [
      { value: "Shopify", label: "Platform" },
      { value: "Supplement", label: "Category" },
    ],
    tags: ["Shopify", "Supplement"],
  },
  "pimax-shopify": {
    eyebrow: "Premium ecommerce",
    title: "Pimax VR Ecommerce Website",
    summary:
      "A polished Shopify brand experience for premium VR hardware, supporting product discovery and campaign presentation.",
    role: "Supported Shopify website design, front end build, and responsive QA.",
    outcome: "Premium storefront presentation for a high consideration tech product.",
    metrics: [
      { value: "Shopify", label: "Platform" },
      { value: "VR Tech", label: "Category" },
    ],
    tags: ["Shopify", "Brand site"],
  },
  "wordpress-woocommerce-30m": {
    eyebrow: "NDA safe revenue proof",
    title: "WordPress / WooCommerce Sales Dashboard",
    summary:
      "A confidential WordPress commerce project presented through cropped revenue proof while protecting client and campaign details.",
    role: "Supported WordPress/WooCommerce commerce flow, tracking aware launch execution, and proof safe presentation.",
    outcome: "$30.0M total sales exposure across a high volume WooCommerce environment.",
    metrics: [
      { value: "$30.0M", label: "Total sales" },
      { value: "8,806", label: "Orders" },
    ],
    tags: ["WordPress", "NDA proof"],
  },
  "wordpress-funnelkit-2m": {
    eyebrow: "Funnel performance",
    title: "Marketing Funnel Revenue Snapshot",
    summary:
      "A WordPress funnel proof snapshot showing revenue, contacts, orders, and upsell activity without exposing private campaign creative.",
    role: "Supported WordPress funnel flow, reviewed checkout UX, documented sales proof.",
    outcome: "$2.35M revenue proof from a WordPress funnel environment.",
    metrics: [
      { value: "$2.35M", label: "Revenue" },
      { value: "16,566", label: "Orders" },
    ],
    tags: ["WordPress", "Funnel proof"],
  },
  "wordpress-campaign-2m": {
    eyebrow: "WooCommerce proof",
    title: "WooCommerce Campaign Sales Proof",
    summary:
      "An NDA safe commerce proof entry showing WordPress campaign performance while keeping the client and offer private.",
    role: "Supported WooCommerce campaign flow, prepared NDA safe performance proof.",
    outcome: "$2.32M total sales proof from WooCommerce campaign activity.",
    metrics: [
      { value: "$2.32M", label: "Total sales" },
      { value: "19,216", label: "Orders" },
    ],
    tags: ["WordPress", "Sales proof"],
  },
  "wordpress-checkout-153k": {
    eyebrow: "Checkout flow proof",
    title: "Checkout Flow Performance Snapshot",
    summary:
      "A private WordPress checkout example showing sales and order activity without exposing product, client, or campaign details.",
    role: "Reviewed checkout flow, supported payment path QA, prepared sales proof.",
    outcome: "$153.7K checkout flow proof with order activity preserved in an NDA safe format.",
    metrics: [
      { value: "$153.7K", label: "Total sales" },
      { value: "128", label: "Orders" },
    ],
    tags: ["WordPress", "Checkout"],
  },
  aquablast: {
    eyebrow: "Campaign landing page",
    title: "Responsive WordPress Landing Page",
    summary:
      "A bright family product landing page with a clear hero offer, benefit checklist, product use visuals, and direct CTA timing.",
    role: "Built WordPress landing page, improved hero flow, handled mobile layout.",
    outcome: "Responsive campaign page with cleaner hero hierarchy and mobile order flow.",
    tags: ["WordPress", "Landing page"],
  },
  "brite-buff": {
    eyebrow: "Beauty landing page",
    title: "Beauty Product WordPress Page",
    summary:
      "A beauty product page using softer brand styling, product first visuals, benefit copy, and a clear order path.",
    role: "Built WordPress product page, clarified benefits, improved CTA path.",
    outcome: "Clean beauty offer flow with clearer benefits and purchase direction.",
    tags: ["WordPress", "Beauty"],
  },
  "medtraker-pro": {
    eyebrow: "Health landing page",
    title: "Health Product Landing Page",
    summary:
      "A health focused product page structured around problem solution messaging, product education, and an accessible CTA path.",
    role: "Built WordPress landing page, organized product education, improved CTA flow.",
    outcome: "Clearer health product education with responsive section flow.",
    tags: ["WordPress", "Health"],
  },
  "ziptite-pro": {
    eyebrow: "Product landing page",
    title: "eCommerce WordPress Product Page",
    summary:
      "A clean food sealer landing page with review proof, benefit led copy, green brand direction, and a prominent order CTA.",
    role: "Built WordPress product page, added proof flow, improved order CTA layout.",
    outcome: "Sharper proof flow and order focused CTA hierarchy for a utility product.",
    tags: ["WordPress", "Product page"],
  },
  "nest-marketing": {
    eyebrow: "Agency website",
    title: "Lead generation Agency Website",
    summary:
      "A premium dark agency website with strong hero messaging, service clarity, lead generation CTA flow, and responsive polish.",
    role: "Built responsive agency site, refined service positioning, supported Netlify launch.",
    outcome: "A polished lead generation site with clearer service positioning and launch ready responsiveness.",
    metrics: [
      { value: "Netlify", label: "Platform" },
      { value: "Agency", label: "Website" },
    ],
    tags: ["Netlify", "Agency site"],
  },
  "skeeter-strike-update": {
    eyebrow: "Advertorial bridge page",
    title: "Direct response Advertorial Page",
    summary:
      "A long form advertorial built around urgency, location based messaging, a strong curiosity headline, and a click through path.",
    role: "Built advertorial page, shaped story flow, improved CTA hierarchy.",
    outcome: "Story led warm up page designed to bridge cold traffic into the product offer.",
    tags: ["GoHighLevel", "Advertorial"],
  },
  "vistaveil-executives": {
    eyebrow: "Beauty advertorial",
    title: "Beauty tech Advertorial Page",
    summary:
      "A premium beauty tech advertorial using problem aware framing, editorial credibility cues, and before/after visual context.",
    role: "Built advertorial UX, structured problem aware messaging, improved offer bridge.",
    outcome: "Editorial offer bridge designed for beauty tech shopper education.",
    tags: ["GoHighLevel", "Beauty"],
  },
  "grippit-nurse": {
    eyebrow: "Health advertorial",
    title: "Health Product Advertorial",
    summary:
      "A health product story page using a relatable daily frustration hook, problem solution framing, and mobile first reading flow.",
    role: "Built long form sales page, refined story flow, improved mobile reading.",
    outcome: "Long form sales story structured to warm readers before the product page.",
    tags: ["GoHighLevel", "Health"],
  },
  "automation-inbound-triage-crm": {
    eyebrow: "AI automation system",
    title: "Lead Triage & AI Proposal Engine",
    summary:
      "A backend workflow that captures portfolio leads, enriches company context, scopes requests with Gemini, and sends PDF proposals.",
    role: "Architected webhook intake, enrichment routing, LLM scoping, document generation, CRM sync, and email dispatch.",
    outcome: "A fast, automated follow up layer behind the portfolio contact flow.",
    metrics: [
      { value: "Gemini", label: "AI scoping" },
      { value: "PDF", label: "Proposal output" },
      { value: "Make.com", label: "Webhook engine" },
    ],
    tags: ["Automation", "AI workflow"],
  },
  "ghl-production-automations": {
    eyebrow: "Production CRM automation",
    title: "GoHighLevel Lead Nurture & LTO Pipelines",
    summary:
      "A production CRM workflow handling lead capture, tagging, timed nurture delays, and NDA safe email performance reporting.",
    role: "Configured GoHighLevel routing, CRM fields, follow up sequences, wait nodes, and deliverability monitoring.",
    outcome: "689+ leads routed with 99.3%+ email delivery performance.",
    metrics: [
      { value: "689+", label: "Leads routed" },
      { value: "99.3%+", label: "Delivery" },
    ],
    tags: ["GoHighLevel", "Automation"],
  },
};

function getWorkFilterDefinition(filterId) {
  if (filterId === WORK_ARCHIVE_FILTER) {
    return {
      id: WORK_ARCHIVE_FILTER,
      label: "All projects",
      description: "The full project archive, with the curated presentation kept up front.",
    };
  }

  return (
    workFilters.find((filter) => filter.id === filterId) ?? workFilters[0]
  );
}

function getProjectsForWorkFilter(filterId, entries) {
  if (filterId === WORK_ARCHIVE_FILTER) {
    return entries;
  }

  if (filterId === "featured") {
    return featuredWorkIds
      .map((projectId) => entries.find((project) => project.id === projectId))
      .filter(Boolean);
  }

  if (filterId === "ecommerce") {
    return entries.filter((project) => project.category === "Shopify");
  }

  if (filterId === "landing") {
    return entries.filter((project) =>
      ["WordPress", "Netlify", "GoHighLevel"].includes(project.category),
    );
  }

  if (filterId === "automation") {
    const automationProjects = entries.filter((project) =>
      ["GoHighLevel", "Automations"].includes(project.category),
    );

    const spotlightProjects = automationSpotlightIds
      .map((projectId) =>
        automationProjects.find((project) => project.id === projectId),
      )
      .filter(Boolean);

    return [
      ...spotlightProjects,
      ...automationProjects.filter(
        (project) => !automationSpotlightIds.includes(project.id),
      ),
    ];
  }

  return entries;
}

function getShowcaseMeta(project) {
  return selectedWorkMeta[project.id] ?? {};
}

function getShowcaseTitle(project) {
  return getShowcaseMeta(project).title ?? project.title;
}

function getShowcaseEyebrow(project) {
  return getShowcaseMeta(project).eyebrow ?? project.type ?? project.category;
}

function getShowcaseSummary(project) {
  return getShowcaseMeta(project).summary ?? getCompactProjectSummary(project);
}

function getShowcaseRole(project) {
  return getShowcaseMeta(project).role ?? project.role;
}

function getShowcaseOutcome(project) {
  return getShowcaseMeta(project).outcome ?? getProjectResult(project);
}

function getShowcaseTags(project) {
  return getShowcaseMeta(project).tags ?? getCompactProjectBadges(project);
}

function getShowcaseMetrics(project, limit = 2) {
  return (getShowcaseMeta(project).metrics ?? getResultMetrics(project)).slice(
    0,
    limit,
  );
}

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
const automationFlowSteps = [
  {
    label: "Capture",
    detail: "Forms, checkout events, and lead sources are checked before traffic runs.",
  },
  {
    label: "Route",
    detail: "Data moves into the right CRM, sheet, notification, or pipeline.",
  },
  {
    label: "Track",
    detail: "Key actions are easier to review through tags, events, and proof screenshots.",
  },
  {
    label: "Follow up",
    detail: "The next response path is planned so leads are not left waiting.",
  },
];
const roleFitPaths = [
  {
    icon: ShoppingCart,
    audience: "For founders, brands, and project clients",
    title: "Project Builds & Campaign Support",
    fitHeadline: "When you need a page built and launched cleanly.",
    summary:
      "A practical fit when you need more than a nice layout. I help shape CTA clarity, responsive QA, proof sections, and the lead handoff around the page.",
    chips: [
      "Landing pages",
      "Shopify pages",
      "WordPress builds",
      "Funnels",
      "Form handoff",
    ],
    points: [
      "Offer hierarchy, CTA flow, proof blocks, and mobile behavior",
      "Shopify, WordPress, GoHighLevel, and campaign page support",
      "Forms, tracking, notifications, and CRM handoff awareness",
    ],
  },
  {
    icon: BriefcaseBusiness,
    audience: "For agencies, recruiters, and hiring teams",
    title: "Remote Team & Hiring Support",
    fitHeadline: "When you need dependable remote execution.",
    summary:
      "A strong fit when you need someone who can plug into async workflows, ask practical questions, send clear updates, and support launch details.",
    chips: [
      "Remote support",
      "Front end build",
      "QA",
      "Automation aware",
      "Handoff notes",
    ],
    points: [
      "US, UK, and AU timezone overlap from the Philippines",
      "Available for freelance support and full time remote roles",
      "Organized updates, practical handoff notes, and steady delivery",
    ],
  },
];
const roleFitTrustSignals = [
  "Available for freelance projects",
  "Open to full time remote roles",
  "US, UK, and AU overlap",
  "Async communication ready",
  "Design, build, QA, and handoff support",
];
const hireConfidencePillars = [
  {
    icon: Search,
    label: "Offer strategy",
    title: "Offer clarity before visuals",
    summary:
      "The layout starts with the offer, CTA path, proof, objections, and mobile scanning behavior before visual styling takes over.",
    proof: "Offer, proof, CTA path",
  },
  {
    icon: Gauge,
    label: "Launch support",
    title: "Launch checks are included",
    summary:
      "Responsive states, links, forms, buttons, and key CTA paths are checked before handoff or traffic launch.",
    proof: "Responsive, forms, links",
  },
  {
    icon: Workflow,
    label: "Lead handoff",
    title: "Handoff risk is reduced",
    summary:
      "Forms, routing, notifications, CRM movement, and follow up notes can be planned around the page so leads keep moving.",
    proof: "Forms, CRM, routing",
  },
  {
    icon: BriefcaseBusiness,
    label: "Remote workflow",
    title: "Remote communication stays clear",
    summary:
      "You get direct updates, practical questions, and clean handoff notes that make async work easier to manage.",
    proof: "Updates, questions, notes",
  },
  {
    icon: Code2,
    label: "Platform range",
    title: "Platform flexible",
    summary:
      "I can support Shopify, WordPress, GoHighLevel, React, Netlify, product pages, funnels, and campaign builds.",
    proof: "Shopify, WP, GHL, React",
  },
  {
    icon: TrendingUp,
    label: "Campaign mindset",
    title: "Conversion support is part of the build",
    summary:
      "I look beyond the screen design and shape the page around trust cues, CTA timing, proof sections, and buying confidence.",
    proof: "Trust, CTA, mobile flow",
  },
];


const faqItems = [
  {
    category: "Process",
    question: "What happens after I reach out?",
    answer:
      "I review the page goal, platform, timeline, assets, and handoff needs first. From there, I can suggest the cleanest next step, whether that is a scoped build, page review, or remote support conversation.",
  },
  {
    category: "Timeline",
    question: "How long does a landing page or funnel build usually take?",
    answer:
      "A focused landing page can often move in one to two weeks once copy, assets, and the offer are clear. Larger funnels, ecommerce pages, or automation supported builds need a scoped timeline first.",
  },
  {
    category: "Pricing",
    question: "How do you price project work?",
    answer:
      "Pricing depends on page count, platform, design complexity, integrations, QA needs, and handoff requirements. For ongoing support or remote roles, I can discuss hourly, part time, or full time arrangements.",
  },
  {
    category: "Scope",
    question: "What do you need from me before starting?",
    answer:
      "The offer, product or service details, brand assets, page goal, preferred platform, examples you like, and any tracking or CRM requirements are enough to start a useful scope conversation.",
  },
  {
    category: "QA",
    question: "Do you handle revisions and QA?",
    answer:
      "Yes. I prefer clear review rounds tied to scope, with QA focused on mobile behavior, CTA paths, forms, links, responsive states, and handoff details.",
  },
  {
    category: "Optimization",
    question: "Can you improve an existing landing page?",
    answer:
      "Yes. I can review an existing page, tighten the hierarchy, improve the CTA path, clean up mobile issues, and support the rebuild or refinement.",
  },
  {
    category: "Handoff",
    question: "Can you support forms, tracking, CRM, or automation handoff?",
    answer:
      "Yes. I can help connect forms, webhooks, CRM routing, notifications, and basic tracking support so the page has a clear next step after someone submits.",
  },
  {
    category: "Platforms",
    question: "Which platforms do you work with?",
    answer:
      "My strongest fit is Shopify, WordPress, GoHighLevel, React front ends, Make.com, Zapier, n8n, and campaign landing page workflows.",
  },
  {
    category: "Remote",
    question: "Do you work with remote teams or ongoing support?",
    answer:
      "Yes. I work well with async teams, agencies, founders, and recruiters who need clear updates, reliable handoff, steady execution, and practical campaign support.",
  },
];
const faqConfidenceSignals = [
  "Scope starts with goals and platform",
  "Pricing depends on build complexity",
  "QA and handoff can be included",
  "Remote friendly communication",
];
const hireConfidenceSignals = [
  {
    value: "4+ years",
    label: "Landing pages and campaign assets",
  },
  {
    value: "Design + build + QA",
    label: "One partner for the page and launch details",
  },
  {
    value: "Remote ready",
    label: "Freelance builds and team workflows",
  },
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
  const name = values.name.trim();
  const email = values.email.trim();
  const message = values.message.trim();

  if (!name) {
    errors.name = "Enter your name.";
  } else if (name.length > MAX_CONTACT_NAME_LENGTH) {
    errors.name = `Keep your name under ${MAX_CONTACT_NAME_LENGTH} characters.`;
  }

  if (!emailPattern.test(email)) {
    errors.email = "Enter a valid email address.";
  } else if (email.length > MAX_CONTACT_EMAIL_LENGTH) {
    errors.email = `Keep your email under ${MAX_CONTACT_EMAIL_LENGTH} characters.`;
  }

  if (message.length < 20) {
    errors.message = "Add at least 20 characters so I can understand the goal.";
  } else if (message.length > MAX_CONTACT_MESSAGE_LENGTH) {
    errors.message = `Keep your message under ${MAX_CONTACT_MESSAGE_LENGTH} characters.`;
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

function isAutomationShowcaseProject(project) {
  return ["Automations"].includes(project.category);
}

function ProjectPerformanceProof({ project }) {
  const dimensions = getImageDimensions(project.proofImage, {
    width: 1200,
    height: 180,
  });

  return (
    <details className="project-performance-proof">
      <summary aria-label={`Enlarge ${project.title} performance proof`}>
        <span className="project-performance-proof__heading">
          <span>
            <BarChart3 size={16} aria-hidden="true" />
            Performance proof
          </span>
          <strong>
            <span className="project-performance-proof__open-label">View larger</span>
            <span className="project-performance-proof__close-label">Close enlarged view</span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </strong>
        </span>

        <BlurImage
          className="project-performance-proof__preview"
          wrapperClassName="project-performance-proof__preview-shell"
          src={project.proofImage}
          alt=""
          width={dimensions.width}
          height={dimensions.height}
          sizes="(max-width: 720px) 88vw, (max-width: 1120px) 44vw, 520px"
          loading="lazy"
          decoding="async"
        />
      </summary>

      <div className="project-performance-proof__expanded">
        <p>{project.proofNote ?? "Cropped dashboard proof with sensitive details excluded."}</p>
        <div
          className="project-performance-proof__viewport"
          role="region"
          aria-label={`${project.title} enlarged performance screenshot`}
          tabIndex="0"
        >
          <BlurImage
            className="project-performance-proof__image"
            wrapperClassName="project-performance-proof__image-shell"
            src={project.proofImage}
            alt={`${project.title} performance dashboard proof`}
            width={dimensions.width}
            height={dimensions.height}
            sizes="(max-width: 720px) 960px, min(1100px, 90vw)"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </details>
  );
}

function FeaturedProjectCard({
  project,
  onOpenCaseStudy,
  onOpenAutomationModal,
}) {
  const displayTitle = getShowcaseTitle(project);
  const displayRole = getShowcaseRole(project);
  const canOpenCaseStudy = Boolean(project.caseStudy || project.caseStudyData);
  const opensAutomationModal = isAutomationShowcaseProject(project);
  const projectUrl = getSafeExternalHref(project.link);
  const projectHost = project.nda
    ? "NDA safe proof"
    : projectUrl
      ? getSafeHostname(projectUrl)
      : "Case study preview";

  return (
    <article
      className="work-feature-card reveal-item"
      style={{
        "--reveal-delay": "0ms",
      }}
    >
      <div className="work-feature-card__media">
        <div className="project-browser" aria-hidden="true">
          <span />
          <span />
          <span />
          <p>{projectHost}</p>
        </div>

        <BlurImage
          className="work-feature-card__image"
          wrapperClassName="work-feature-card__image-shell"
          src={project.image}
          alt={project.imageAlt}
          width={getImageDimensions(project.image).width}
          height={getImageDimensions(project.image).height}
          sizes="(max-width: 760px) 92vw, (max-width: 1120px) 86vw, 650px"
          loading="lazy"
          decoding="async"
        />

        <div className="work-feature-card__proof-pill">
          <TrendingUp size={15} aria-hidden="true" />
          <span>Flagship proof</span>
        </div>
      </div>

      <div className="work-feature-card__content">
        <p className="work-feature-card__eyebrow">{getShowcaseEyebrow(project)}</p>
        <h3>{displayTitle}</h3>
        <p className="work-feature-card__summary">{getShowcaseSummary(project)}</p>

        <div className="work-feature-card__role">
          <BriefcaseBusiness size={17} aria-hidden="true" />
          <span>
            <strong>My role</strong>
            {getContributionLine(project, displayRole)}
          </span>
        </div>

        {project.proofImage ? (
          <ProjectPerformanceProof project={project} />
        ) : (
          <div
            className="work-feature-card__metrics"
            aria-label={`${project.title} featured proof metrics`}
          >
            {getShowcaseMetrics(project, 3).map((metric) => (
              <div key={`feature-${project.id}-${metric.label}`}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="work-feature-card__outcome">
          <BarChart3 size={16} aria-hidden="true" />
          <span>{getShowcaseOutcome(project)}</span>
        </div>

        <div className="project-tags">
          {getShowcaseTags(project).map((badge) => (
            <span key={`feature-${project.id}-${badge}`}>{badge}</span>
          ))}
        </div>

        <div className="project-actions project-actions--editorial">
          <button
            className="project-action project-action--case-study"
            type="button"
            onClick={() =>
              opensAutomationModal
                ? onOpenAutomationModal(project.id)
                : onOpenCaseStudy(project.id)
            }
            disabled={!canOpenCaseStudy}
          >
            View case study
            <FileText size={16} aria-hidden="true" />
          </button>

          {projectUrl ? (
            <a
              className="project-action project-action--live"
              href={projectUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit live site
              <ExternalLink size={16} aria-hidden="true" />
            </a>
          ) : (
            <span className="project-locked">
              <Lock size={15} aria-hidden="true" />
              Live page hidden by NDA
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function ProjectCard({
  project,
  onOpenCaseStudy,
  onOpenAutomationModal,
  index = 0,
}) {
  const displayTitle = getShowcaseTitle(project);
  const displayRole = getShowcaseRole(project);
  const canOpenCaseStudy = Boolean(project.caseStudy || project.caseStudyData);
  const opensAutomationModal = isAutomationShowcaseProject(project);
  const projectUrl = getSafeExternalHref(project.link);
  const projectHost = project.nda
    ? "NDA safe proof"
    : projectUrl
      ? getSafeHostname(projectUrl)
      : "Case study preview";

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
            {projectHost}
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
          <span>{getShowcaseEyebrow(project)}</span>
          <h3>{displayTitle}</h3>
          <p>{displayRole}</p>
        </div>
      </div>

      <div className="project-body">
        <div className="project-topline">
          <span>{getShowcaseEyebrow(project)}</span>
          <strong>{project.number}</strong>
        </div>

        <h3>{displayTitle}</h3>
        <p className="project-summary">{getShowcaseSummary(project)}</p>

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
            {getShowcaseOutcome(project)}
          </span>
        </div>

        {project.proofImage ? (
          <ProjectPerformanceProof project={project} />
        ) : (
          <div
            className="project-metrics project-metrics--compact"
            aria-label={`${project.title} key metrics`}
          >
            {getShowcaseMetrics(project).map((metric) => (
              <div className="project-metric" key={`${project.id}-${metric.label}`}>
                <strong className="project-metric__value">{metric.value}</strong>
                <span className="project-metric__label">{metric.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="project-tags">
          {getShowcaseTags(project).map((badge) => (
            <span key={`${project.id}-${badge}`}>{badge}</span>
          ))}
        </div>

        <div className="project-actions project-actions--editorial">
          <button
            className="project-action project-action--case-study"
            type="button"
            onClick={() =>
              opensAutomationModal
                ? onOpenAutomationModal(project.id)
                : onOpenCaseStudy(project.id)
            }
            disabled={!canOpenCaseStudy}
          >
            View case study
            <FileText size={16} aria-hidden="true" />
          </button>

          {projectUrl ? (
            <a
              className="project-action project-action--live"
              href={projectUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Live page
              <ExternalLink size={16} aria-hidden="true" />
            </a>
          ) : (
            <span className="project-locked">
              <Lock size={15} aria-hidden="true" />
              Live page hidden by NDA
            </span>
          )}
        </div>
      </div>
    </article>
  );
}


function AutomationArchitectureCard({ project, onOpenModal, index = 0 }) {
  const safeCalendlyUrl = getSafeExternalHref(project.calendlyUrl);
  const calendlyHref = safeCalendlyUrl || "#contact";
  const automationMetrics = project.metrics?.length
    ? project.metrics
    : [
        { value: "Make.com / Webhooks", label: "Orchestration" },
        { value: "Gemini 2.5 Flash", label: "LLM Scoping" },
        { value: "Google Docs → PDF", label: "Dynamic Proposal" },
        { value: "Sheets + Gmail", label: "CRM + Dispatch" },
      ];

  function handleCalendlyClick(event) {
    if (!safeCalendlyUrl) {
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
            href={calendlyHref}
            target={safeCalendlyUrl ? "_blank" : undefined}
            rel={safeCalendlyUrl ? "noopener noreferrer" : undefined}
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

  const projectUrl = getSafeExternalHref(project.link);
  const projectHost = project.nda
    ? "NDA safe case study"
    : projectUrl
      ? getSafeHostname(projectUrl)
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
            {projectUrl ? (
              <a href={projectUrl} target="_blank" rel="noopener noreferrer">
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
            A lower risk build partner for pages that need to launch cleanly.
          </h2>
          <p>
            You get someone who thinks through offer clarity, responsive behavior,
            form handoff, tracking support, and launch QA before traffic goes live.
          </p>
        </div>

        <div className="hire-confidence-layout">
          <aside
            className="hire-confidence-lead-card reveal-item"
            style={{ "--reveal-delay": "0ms" }}
          >
            <span className="hire-confidence-lead-card__eyebrow">Risk reduced at launch</span>
            <h3>Built for clients who need the page to work after the handoff.</h3>
            <p>
              A strong fit when you need design, front end execution, QA, and workflow
              awareness handled together without adding extra coordination burden.
            </p>

            <div className="hire-confidence-signal-list" aria-label="Trust signals">
              {hireConfidenceSignals.map((signal) => (
                <span key={signal.value}>
                  <CheckCircle2 size={15} aria-hidden="true" />
                  <span>
                    <strong>{signal.value}</strong>
                    <small>{signal.label}</small>
                  </span>
                </span>
              ))}
            </div>

            <div className="hire-confidence-fit-note">
              <span>Best fit</span>
              <p>
                Landing pages, funnels, ecommerce pages, CRM handoffs, automation
                supported campaigns, and remote team execution.
              </p>
            </div>
          </aside>

          <div className="hire-confidence-grid">
            {hireConfidencePillars.map((pillar, index) => {
              const Icon = pillar.icon;

              return (
                <article
                  className={[
                    "hire-confidence-card",
                    "reveal-item",
                    index === 0 ? "hire-confidence-card--featured" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={pillar.title}
                  style={{ "--reveal-delay": `${80 + index * 55}ms` }}
                >
                  <span className="hire-confidence-card__icon">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <div className="hire-confidence-card__copy">
                    <span className="hire-confidence-card__label">{pillar.label}</span>
                    <h3>{pillar.title}</h3>
                  </div>
                  <p>{pillar.summary}</p>
                  <span className="hire-confidence-card__proof">{pillar.proof}</span>
                </article>
              );
            })}
          </div>
        </div>

        <div
          className="hire-confidence-footer reveal-item"
          style={{ "--reveal-delay": "160ms" }}
        >
          <div>
            <span>Ready for practical execution</span>
            <p>
              Need a page, funnel, or campaign asset that is easier to launch and trust?
            </p>
          </div>

          <div className="hire-confidence-actions">
            <a className="btn btn--primary" href="#contact">
              <Mail size={18} aria-hidden="true" />
              Start a project conversation
            </a>
            <a className="btn btn--secondary" href="#automation">
              <Workflow size={18} aria-hidden="true" />
              View workflow support
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}


function FAQSection() {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  return (
    <section className="faq-section" aria-labelledby="faq-title">
      <div className="faq-shell">
        <div className="faq-heading">
          <p className="section-kicker">Common questions</p>
          <h2 id="faq-title">Clear answers before we talk scope.</h2>
          <p>
            Quick answers on timelines, pricing, platforms, revisions, handoff,
            and remote collaboration so you know what to expect before starting a conversation.
          </p>

          <div className="faq-confidence-card" aria-label="Before you reach out checklist">
            <span>Before you reach out</span>
            <ul>
              {faqConfidenceSignals.map((signal) => (
                <li key={signal}>
                  <CheckCircle2 size={15} aria-hidden="true" />
                  {signal}
                </li>
              ))}
            </ul>
          </div>

          <div className="faq-cta-card">
            <span>Still sounds like a fit?</span>
            <a href="#contact">
              <Mail size={17} aria-hidden="true" />
              Start a project conversation
            </a>
          </div>
        </div>

        <div className="faq-list">
          {faqItems.map((item, index) => {
            const isOpen = openFaqIndex === index;

            return (
              <details
                className="faq-item"
                key={item.question}
                open={isOpen}
                onToggle={(event) => {
                  if (event.currentTarget.open) {
                    setOpenFaqIndex(index);
                  } else if (isOpen) {
                    setOpenFaqIndex(null);
                  }
                }}
              >
                <summary>
                  <span className="faq-item__question">
                    <small>{item.category}</small>
                    {item.question}
                  </span>
                  <span className="faq-item__control" aria-hidden="true">
                    <span />
                    <span />
                  </span>
                </summary>
                <p>{item.answer}</p>
              </details>
            );
          })}
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
          <h2 id="role-fit-title">
            I am a strong fit when the page, handoff, and launch details all matter.
          </h2>
          <p>
            I support founders, agencies, ecommerce teams, and hiring teams that
            need front end execution, conversion thinking, automation awareness,
            and clear remote communication in one practical workflow.
          </p>
        </div>

        <div className="role-fit-grid role-fit-grid--paths">
          {roleFitPaths.map((card, index) => {
            const Icon = card.icon;

            return (
              <article
                className="role-fit-card role-fit-card--path"
                key={card.title}
              >
                <div className="role-fit-card__top">
                  <span className="role-fit-card__icon">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span className="role-fit-card__index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="role-fit-card__copy">
                  <span className="role-fit-card__audience">{card.audience}</span>
                  <h3>{card.title}</h3>
                  <strong>{card.fitHeadline}</strong>
                  <p>{card.summary}</p>
                </div>

                <div
                  className="role-fit-card__chips"
                  aria-label={`${card.title} best fit work`}
                >
                  {card.chips.map((chip) => (
                    <span key={chip}>{chip}</span>
                  ))}
                </div>

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
          <div className="role-fit-trust-strip" aria-label="Role fit trust signals">
            {roleFitTrustSignals.map((signal) => (
              <span key={signal}>
                <CheckCircle2 size={15} aria-hidden="true" />
                {signal}
              </span>
            ))}
          </div>

          <div className="role-fit-cta-panel">
            <div>
              <span>Ready to check fit?</span>
              <p className="role-fit-availability">
                Open to project work, ongoing support, and full time remote opportunities.
              </p>
            </div>

            <div className="role-fit-actions">
              <a className="btn btn--primary" href="#contact">
                <Mail size={18} aria-hidden="true" />
                Start a project conversation
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

          <ol className="automation-mobile-flow" aria-label="Simplified lead flow">
            {automationFlowSteps.map((step, index) => (
              <li key={step.label}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{step.label}</strong>
                  <p>{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>

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
  const [activeSection, setActiveSection] = useState("#top");
  const [isCompactWorkViewport, setIsCompactWorkViewport] = useState(false);
  const [privacyPreferencesOpen, setPrivacyPreferencesOpen] = useState(false);
  const workFilterTimers = useRef([]);
  const workSectionRef = useRef(null);
  const contactFormRef = useRef(null);
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

  function getWorkFilterCount(filterId) {
    return getProjectsForWorkFilter(filterId, selectedWorkEntries).length;
  }

  const selectedWorkProjects = useMemo(
    () => getProjectsForWorkFilter(renderedWorkFilter, selectedWorkEntries),
    [renderedWorkFilter, selectedWorkEntries],
  );
  const activeWorkFilterDefinition = getWorkFilterDefinition(activeWorkFilter);
  const renderedWorkFilterDefinition = getWorkFilterDefinition(renderedWorkFilter);
  const workPageSize = isCompactWorkViewport
    ? COMPACT_WORK_PAGE_SIZE
    : WORK_PAGE_SIZE;
  const visibleWorkProjects = useMemo(
    () => selectedWorkProjects.slice(0, visibleWorkCount),
    [selectedWorkProjects, visibleWorkCount],
  );
  const featuredProject = visibleWorkProjects[0] ?? null;
  const supportingWorkProjects = visibleWorkProjects.slice(1);
  const hasMoreWork = visibleWorkCount < selectedWorkProjects.length;
  const canToggleWorkCount = selectedWorkProjects.length > workPageSize;
  const visibleWorkTotal = Math.min(
    visibleWorkCount,
    selectedWorkProjects.length,
  );
  const isArchiveWorkFilter = renderedWorkFilter === WORK_ARCHIVE_FILTER;

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

  useEffect(() => {
    const compactWorkQuery = window.matchMedia("(max-width: 640px)");

    function syncCompactWorkViewport() {
      setIsCompactWorkViewport(compactWorkQuery.matches);
    }

    syncCompactWorkViewport();

    if (compactWorkQuery.addEventListener) {
      compactWorkQuery.addEventListener("change", syncCompactWorkViewport);

      return () => {
        compactWorkQuery.removeEventListener("change", syncCompactWorkViewport);
      };
    }

    compactWorkQuery.addListener(syncCompactWorkViewport);

    return () => {
      compactWorkQuery.removeListener(syncCompactWorkViewport);
    };
  }, []);

  useEffect(() => {
    setVisibleWorkCount((currentCount) =>
      currentCount === WORK_PAGE_SIZE || currentCount === COMPACT_WORK_PAGE_SIZE
        ? workPageSize
        : currentCount,
    );
  }, [workPageSize]);

  useEffect(() => {
    const sectionHrefs = ["#top", ...navLinks.map((link) => link.href)];

    function updateActiveSection() {
      const marker = window.innerHeight * 0.32;
      const nextSection = sectionHrefs.reduce((currentHref, href) => {
        const section = document.querySelector(href);

        if (!section) {
          return currentHref;
        }

        return section.getBoundingClientRect().top <= marker
          ? href
          : currentHref;
      }, "#top");

      setActiveSection(nextSection);
    }

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
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
        ".work-feature-card",
        ".contact-card",
        ".contact-form",
        ".work-proof-row",
        ".work-proof-strip",
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
    setVisibleWorkCount(workPageSize);

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
    setActiveSection(href);

    const targetSection = document.querySelector(href);

    if (targetSection) {
      targetSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      window.history.pushState(null, "", href);
    }
  }

  function handleWorkVisibilityToggle() {
    if (hasMoreWork) {
      setVisibleWorkCount((currentCount) =>
        Math.min(currentCount + workPageSize, selectedWorkProjects.length),
      );

      return;
    }

    setVisibleWorkCount(workPageSize);

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
    } catch {
      console.error("Email copy failed.");
      window.location.href = `mailto:${profile.email}`;
    }
  }

  async function handleContactSubmit(event) {
    event.preventDefault();

    const nextErrors = validateContactForm(contactForm, selectedProjectType);
    const isContactIntegrationReady = Boolean(HCAPTCHA_SITE_KEY);
    setContactTouched({
      name: true,
      email: true,
      message: true,
    });
    setContactErrors(nextErrors);

    const formData = new FormData(event.currentTarget);
    if (formData.get("botcheck")) {
      setContactStatus({
        type: "success",
        message: "Inquiry sent successfully. I will be in touch within 24 hours.",
      });
      return;
    }

    if (Object.keys(nextErrors).length > 0) {
      const firstInvalidField = getFirstInvalidContactField(nextErrors);

      window.requestAnimationFrame(() => {
        contactFormRef.current
          ?.querySelector(`[name="${firstInvalidField}"]`)
          ?.focus();
      });

      setContactStatus({
        type: "error",
        message: "Please complete the required fields before sending.",
      });
      return;
    }

    if (!isContactIntegrationReady) {
      setContactStatus({
        type: "error",
        message:
          "Contact form security keys are not configured. Please add the Vercel environment variables first.",
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
      const sanitizedContactForm = {
        name: contactForm.name.trim().slice(0, MAX_CONTACT_NAME_LENGTH),
        email: contactForm.email.trim().toLowerCase().slice(0, MAX_CONTACT_EMAIL_LENGTH),
        message: contactForm.message.trim().slice(0, MAX_CONTACT_MESSAGE_LENGTH),
      };

      const response = await fetch(AUTOMATION_LEAD_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          captchaToken,
          email: sanitizedContactForm.email,
          message: sanitizedContactForm.message,
          name: sanitizedContactForm.name,
          projectIdea: sanitizedContactForm.message,
          projectType: selectedProjectType || "Not selected",
          submissionType: "contact_form",
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessages = {
          403: "Security verification failed. Please complete the captcha again.",
          429: "Too many requests. Please wait a few minutes and try again.",
          502: "The secure form service is temporarily unavailable. Please try again.",
          503: "The secure form service is temporarily unavailable. Please try again.",
        };
        setContactStatus({
          type: "error",
          message: errorMessages[response.status] || data.error || "Unable to send right now. Please try again.",
        });
        setCaptchaToken("");
        captchaRef.current?.resetCaptcha();
        return;
      }

      sendAnalyticsEvent({
        category: "Form",
        action: "Submitted Contact Form",
        label: "Quick Inquiry",
      });

      sendAnalyticsEvent("generate_lead", {
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
    } catch {
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
  const isContactIntegrationReady = Boolean(HCAPTCHA_SITE_KEY);
  const contactSubmitDisabled = contactSubmitting || !isContactIntegrationReady;

  return (
    <main className="portfolio-shell">
      <NoiseOverlay />
      <section className="hero hero--portfolio-showcase" aria-labelledby="hero-title">
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
                className={activeSection === link.href ? "is-active" : undefined}
                aria-current={activeSection === link.href ? "page" : undefined}
                onClick={(event) => handleNavClick(event, link.href)}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <a
            className="site-nav__cta"
            href="#contact"
            onClick={(event) => handleNavClick(event, "#contact")}
          >
            Start a project
          </a>

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
                  className={activeSection === link.href ? "is-active" : undefined}
                  aria-current={activeSection === link.href ? "page" : undefined}
                  onClick={(event) => handleNavClick(event, link.href)}
                >
                  {link.label}
                </a>
              ))}

              <div className="site-nav__mobile-actions">
                <a
                  className="site-nav__mobile-primary"
                  href="#contact"
                  onClick={(event) => handleNavClick(event, "#contact")}
                >
                  Start a project
                </a>

                <a
                  className="site-nav__mobile-secondary"
                  href={profile.resumePath}
                  download="JohnMichael_Bonganay_Resume.pdf"
                >
                  Download resume
                </a>
              </div>
            </nav>
          ) : null}
        </header>

        <div
          className="hero__content hero__content--mobile-optimized hero__content--showcase"
          id="top"
        >
          <div className="hero__copy">
            <p className="eyebrow hero__role-badge hero-animate hero-animate--badge">
              <span className="status-dot" aria-hidden="true" />
              {profile.role}
            </p>

            <h1 id="hero-title" className="hero-animate hero-animate--title">
              {profile.headline.before}{" "}
              <span className="hero__headline-accent">{profile.headline.accent}</span>{" "}
              {profile.headline.after}
            </h1>

            <div className="hero-animate hero-animate--subtext">
              <p className="hero__summary">{profile.summary}</p>
            </div>

            <div
              className="hero__actions hero-animate hero-animate--actions"
              aria-label="Primary actions"
            >
              <MagneticCTA
                className="btn btn--primary hero__primary-cta"
                href="#work"
                strength={12}
                onClick={() => {
                  sendAnalyticsEvent({
                    category: "User",
                    action: "Clicked Hero CTA",
                    label: "Selected Work",
                  });
                }}
              >
                View selected work
                <ArrowUpRight className="hero__primary-cta-icon" size={18} aria-hidden="true" />
              </MagneticCTA>

              <a className="btn btn--secondary" href="#contact">
                <Mail size={18} aria-hidden="true" />
                Start a project
              </a>
            </div>

            <div className="hero-trust hero-animate hero-animate--meta">
              <div className="hero-trust__identity">
                <img
                  src={johnMichaelPortrait}
                  alt="John Michael Bonganay"
                  width="64"
                  height="64"
                  loading="eager"
                  decoding="async"
                />
                <span>
                  <strong>{profile.name}</strong>
                  <small>Philippines · working worldwide</small>
                </span>
              </div>

              <ul className="hero-trust__proof" aria-label="Portfolio trust signals">
                {profile.heroProof.map((proof) => (
                  <li key={proof.label}>
                    <strong>{proof.value}</strong>
                    <span>{proof.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside
            className="hero-showcase hero-animate hero-animate--portrait"
            aria-label="Selected portfolio project previews"
          >
            <div className="hero-showcase__glow" aria-hidden="true" />

            <div className="hero-showcase__result">
              <TrendingUp size={16} aria-hidden="true" />
              <span>Sales backed design</span>
              <strong>$52.9K</strong>
            </div>

            <article className="hero-project hero-project--primary">
              <div className="hero-project__browser" aria-hidden="true">
                <span />
                <span />
                <span />
                <small>barkchester.com</small>
              </div>
              <BlurImage
                src="/work/barkchester-united.webp"
                alt="Barkchester United Shopify product page"
                width={1440}
                height={722}
                sizes="(max-width: 960px) 92vw, 540px"
                wrapperClassName="hero-project__image-shell"
                className="hero-project__image"
                loading="eager"
                fetchpriority="high"
              />
              <div className="hero-project__caption">
                <span>
                  <small>Shopify product page</small>
                  <strong>Barkchester United</strong>
                </span>
                <em>4.82% conversion</em>
              </div>
            </article>

            <article className="hero-project hero-project--secondary">
              <div className="hero-project__browser" aria-hidden="true">
                <span />
                <span />
                <span />
                <small>purelynutrient.com</small>
              </div>
              <BlurImage
                src="/work/purely-nutrient.webp"
                alt="Purely Nutrient Black Seed Oil Shopify product page"
                width={1901}
                height={951}
                sizes="(max-width: 960px) 52vw, 300px"
                wrapperClassName="hero-project__image-shell"
                className="hero-project__image"
                loading="lazy"
              />
              <div className="hero-project__mini-label">Shopify supplement</div>
            </article>

            <article className="hero-project hero-project--tertiary">
              <div className="hero-project__browser" aria-hidden="true">
                <span />
                <span />
                <span />
                <small>make.com / webhook pipeline</small>
              </div>
              <BlurImage
                src="/work/automation-inbound-triage-pipeline.webp"
                alt="Inbound lead triage automation pipeline"
                width={1835}
                height={879}
                sizes="(max-width: 960px) 48vw, 280px"
                wrapperClassName="hero-project__image-shell"
                className="hero-project__image"
                loading="lazy"
              />
              <div className="hero-project__mini-label">AI lead automation</div>
            </article>
          </aside>
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
                Selected work built to convert, scale, and perform.
              </h2>
              <p>
                Ecommerce experiences, campaign pages, and automation systems,
                designed and built with measurable outcomes behind them.
              </p>
            </div>
          </div>

          <div className="work-proof-strip" aria-label="Proof backed selected work highlights">
            <span>Proof backed showcase</span>
            {workProofHighlights.map((proof) => (
              <strong key={proof.label}>
                {proof.value}
                <small>{proof.label}</small>
              </strong>
            ))}
          </div>

          <div className="work-curation-row">
            <div>
              <p className="work-filter-note">
                {activeWorkFilterDefinition.label} case studies first.
              </p>
              <p className="work-proof-note">
                {activeWorkFilterDefinition.description} Dashboard screenshots stay NDA safe when proof appears inside case studies.
              </p>
            </div>

            <div className="work-controls-shell work-controls-shell--fade">
              <div className="work-controls" aria-label="Filter selected works by project type">
              {workFilters.map((filter) => {
                const isActive = activeWorkFilter === filter.id;

                return (
                  <button
                    className={isActive ? "work-filter is-active" : "work-filter"}
                    type="button"
                    key={filter.id}
                    onClick={() => handleWorkFilterChange(filter.id)}
                    aria-pressed={isActive}
                  >
                    <span>{filter.label}</span>
                  </button>
                );
              })}
              </div>
            </div>
          </div>

          <div
            className={
              isArchiveWorkFilter
                ? "work-showcase work-showcase--archive"
                : "work-showcase"
            }
            id="selected-work-grid"
            aria-live="polite"
          >
            {featuredProject ? (
              <FeaturedProjectCard
                project={featuredProject}
                onOpenCaseStudy={setSelectedCaseStudyId}
                onOpenAutomationModal={setSelectedAutomationModalId}
              />
            ) : null}

            {supportingWorkProjects.length ? (
              <StaggeredGrid
                key={`work-grid-${renderedWorkFilter}-${visibleWorkProjects.length}`}
                className={`work-grid work-grid--supporting ${workGridPhase}`}
              >
                {supportingWorkProjects.map((project, index) => (
                  <StaggeredGridItem key={`${renderedWorkFilter}-${project.id}`} className="motion-work-item">
                    <HoverCard className="motion-work-hover">
                      <ProjectCard
                        project={project}
                        index={index + 1}
                        onOpenCaseStudy={setSelectedCaseStudyId}
                        onOpenAutomationModal={setSelectedAutomationModalId}
                      />
                    </HoverCard>
                  </StaggeredGridItem>
                ))}
              </StaggeredGrid>
            ) : null}
          </div>

          {canToggleWorkCount ? (
            <div className="work-more" aria-label="Selected works pagination">
              <p className="work-more__count">
                Showing <strong>{visibleWorkTotal}</strong> of{" "}
                <strong>{selectedWorkProjects.length}</strong>{" "}
                {isArchiveWorkFilter
                  ? "projects"
                  : `${renderedWorkFilterDefinition.label.toLowerCase()} projects`}
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
          ) : !isArchiveWorkFilter ? (
            <div className="work-more work-more--archive" aria-label="Selected works archive">
              <p className="work-more__count">
                Viewing <strong>{renderedWorkFilterDefinition.label}</strong>. Full archive includes{" "}
                <strong>{getWorkFilterCount(WORK_ARCHIVE_FILTER)}</strong> projects.
              </p>

              <button
                className="show-work-toggle"
                type="button"
                onClick={() => handleWorkFilterChange(WORK_ARCHIVE_FILTER)}
                aria-controls="selected-work-grid"
              >
                <span>Explore all projects</span>
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
          <div className="contact-card contact-card--project-first">
            <div className="contact-cta">
              <p className="section-kicker">{contactCopy.eyebrow}</p>

              <h2 id="contact-title">{contactCopy.headline}</h2>

              <p>{contactCopy.introduction}</p>

              <div className="contact-secondary">
                <p>Prefer direct contact?</p>

                <div className="contact-direct" aria-label="Direct contact links">
                  <div className="contact-email-actions">
                    <a href={`mailto:${profile.email}`}>
                      <Mail size={18} aria-hidden="true" />
                      <span>
                        <small>Email John</small>
                        <strong>{profile.email}</strong>
                      </span>
                    </a>

                    <button
                      className={
                        emailCopied
                          ? "contact-copy-action is-copied"
                          : "contact-copy-action"
                      }
                      type="button"
                      onClick={handleCopyEmail}
                      aria-label={`Copy email address ${profile.email}`}
                    >
                      {emailCopied ? "Copied" : "Copy address"}
                    </button>
                  </div>

                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={18} aria-hidden="true" />
                    <span>
                      <small>LinkedIn</small>
                      <strong>Connect on LinkedIn</strong>
                    </span>
                  </a>
                </div>
              </div>

              <ul
                className="contact-trust-list"
                aria-label="Availability and project support signals"
              >
                {contactTrustSignals.map((signal) => (
                  <li key={signal}>
                    <CheckCircle2 size={15} aria-hidden="true" />
                    {signal}
                  </li>
                ))}
              </ul>
            </div>

            <form
              ref={contactFormRef}
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
                    <div>
                      <div className="contact-form__eyebrow">
                        <span className="status-dot" aria-hidden="true" />
                        <p>{contactCopy.formEyebrow}</p>
                      </div>

                      <h3>{contactCopy.formTitle}</h3>
                      <small>{contactCopy.formHelper}</small>
                    </div>

                    <span className="contact-duration">2 to 3 minutes</span>
                  </div>

                  <div className="contact-primary-fields">
                    <div className={`form-field ${getContactFieldState("name")}`}>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder=" "
                        value={contactForm.name}
                        maxLength={MAX_CONTACT_NAME_LENGTH}
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
                        maxLength={MAX_CONTACT_EMAIL_LENGTH}
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
                  </div>

                  <div
                    className={`project-type-field ${
                      selectedProjectType ? "is-valid" : ""
                    }`}
                    aria-labelledby="contact-project-type-label"
                  >
                    <div className="project-type-label-row">
                      <span id="contact-project-type-label">What can I help with?</span>
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
                      maxLength={MAX_CONTACT_MESSAGE_LENGTH}
                      onChange={handleContactChange}
                      onBlur={handleContactBlur}
                      aria-invalid={Boolean(
                        contactErrors.message && contactTouched.message,
                      )}
                      aria-describedby={
                        contactErrors.message && contactTouched.message
                          ? "contact-message-error"
                          : "contact-message-hint"
                      }
                      required
                    />
                    <label htmlFor="contact-message">{contactCopy.messageLabel}</label>

                    <span className="form-field__hint" id="contact-message-hint">
                      {contactCopy.messageHint}
                    </span>

                    {contactErrors.message && contactTouched.message ? (
                      <small id="contact-message-error">
                        {contactErrors.message}
                      </small>
                    ) : null}
                  </div>

                  <div className="contact-security-row">
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
                            : contactCopy.submitLabel}
                      </span>
                      <Send size={18} aria-hidden="true" />
                    </button>
                  </div>

                  <p className="contact-reply-note">
                    <CheckCircle2 size={16} aria-hidden="true" />
                    {contactCopy.fallback}
                  </p>

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
          <section className="footer-cta-card" aria-labelledby="footer-cta-title">
            <div className="footer-cta-copy">
              <p className="footer-eyebrow">Available for freelance and remote support</p>
              <h2 id="footer-cta-title">Have a page, funnel, or workflow to launch?</h2>
              <p>
                Let&apos;s turn the brief into a clear build, tested handoff, and
                launch ready system your team can use with confidence.
              </p>
            </div>

            <div className="footer-cta-actions">
              <a
                className="footer-cta-primary"
                href={`mailto:${profile.email}?subject=Portfolio%20project%20inquiry`}
              >
                <Mail size={18} aria-hidden="true" />
                Start a conversation
              </a>
              <a
                className="footer-cta-secondary"
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                Connect on LinkedIn
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </div>
          </section>

          <div className="footer-main">
            <div className="footer-brand">
              <a
                className="brand"
                href="#top"
                aria-label="John Michael Bonganay home"
                onClick={(event) => handleNavClick(event, "#top")}
              >
                <span>JM</span>
                <div className="footer-brand__identity">
                  <strong>{profile.name}</strong>
                  <small>Conversion focused Front End Developer and Automation Support</small>
                </div>
              </a>
              <p>
                I build landing pages, ecommerce experiences, and lead workflows
                that are easier to launch, test, and hand off.
              </p>
            </div>

            <nav className="footer-links" aria-label="Footer navigation">
              <p className="footer-column-label">Explore</p>
              <ul>
                {footerLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      download={link.download}
                      onClick={
                        link.href.startsWith("#")
                          ? (event) => handleNavClick(event, link.href)
                          : undefined
                      }
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="footer-availability" aria-label="Availability and work fit">
              <p className="footer-column-label">Work fit</p>
              <StatusWidget />
              <ul className="footer-trust-list">
                <li>
                  <CheckCircle2 size={15} aria-hidden="true" />
                  Design, build, QA, and handoff
                </li>
                <li>
                  <CheckCircle2 size={15} aria-hidden="true" />
                  Async friendly communication
                </li>
                <li>
                  <CheckCircle2 size={15} aria-hidden="true" />
                  US, UK, and AU timezone overlap
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copy">
              © {new Date().getFullYear()} John Michael Bonganay. Designed and built
              with React.
            </p>
            <button
              className="footer-privacy-preferences"
              type="button"
              onClick={() => setPrivacyPreferencesOpen(true)}
            >
              Privacy preferences
            </button>
            <a
              className="footer-back-to-top"
              href="#top"
              onClick={(event) => handleNavClick(event, "#top")}
            >
              Back to top
              <ArrowUp size={17} aria-hidden="true" />
            </a>
          </div>
        </div>
      </footer>

      <PrivacyConsent
        forceOpen={privacyPreferencesOpen}
        onClose={() => setPrivacyPreferencesOpen(false)}
      />

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
