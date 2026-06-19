import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { projects } from "../src/data/projects.js";

test("selected-work projects with performance proof images use the approved assets", () => {
  const proofProjects = projects.filter((project) => project.proofImage);

  assert.equal(proofProjects.length, 10);
  assert.deepEqual(
    proofProjects.map((project) => project.proofImage),
    [
      "/work/performance-barkchester.webp",
      "/work/performance-vista-veil.webp",
      "/work/performance-robo-mouse.webp",
      "/work/performance-skin-spectra.webp",
      "/work/performance-grippit.webp",
      "/work/performance-furbulous-spa-brush.webp",
      "/work/performance-skeeter-strike.webp",
      "/work/ghl-acc-optin-performance.webp",
      "/work/ghl-buyer-follow-up-performance.png",
      "/work/ghl-phantom-optin-performance.png",
    ],
  );
});

test("lead nurture automation uses the ACC opt in performance proof", () => {
  const project = projects.find(
    (entry) => entry.id === "ghl-production-automations",
  );

  assert.ok(project);
  assert.equal(project.proofImage, "/work/ghl-acc-optin-performance.webp");
});

test("Phantom opt-in tracker is an NDA-safe CRM routing case study", () => {
  const project = projects.find(
    (entry) => entry.id === "ghl-phantom-optin-tracker",
  );

  assert.ok(project);
  assert.equal(project.number, "42");
  assert.equal(project.category, "Automations");
  assert.equal(project.type, "Lead Routing Automation");
  assert.equal(project.image, "/work/ghl-phantom-optin-tracker.png");
  assert.equal(project.proofImage, "/work/ghl-phantom-optin-performance.png");
  assert.deepEqual(project.badges, ["GoHighLevel", "CRM Automation"]);
  assert.equal(project.link, undefined);
  assert.equal(
    project.result,
    "Created a cleaner lead routing system that helps organize opt in contacts, reduce incomplete contact data issues, and send leads into the correct follow up workflow.",
  );
  assert.match(project.caseStudy.challenge, /routed cleanly after form submission/i);
  assert.match(project.caseStudy.approach, /missing first and last name fields/i);
  assert.deepEqual(project.caseStudy.techStack, [
    "GoHighLevel",
    "CRM Tags",
    "Conditional Logic",
    "Contact Field Updates",
    "Lead Routing",
    "Drip Handoff",
    "Opt in Workflow Automation",
  ]);
});

test("buyer follow-up automation is an NDA-safe CRM automation case study", () => {
  const project = projects.find(
    (entry) => entry.id === "ghl-buyer-follow-up-automation",
  );

  assert.ok(project);
  assert.equal(project.number, "41");
  assert.equal(project.category, "Automations");
  assert.equal(project.type, "Production CRM Automation");
  assert.equal(project.image, "/work/ghl-buyer-follow-up-automation.png");
  assert.equal(project.proofImage, "/work/ghl-buyer-follow-up-performance.png");
  assert.deepEqual(project.badges, ["GoHighLevel", "Automation"]);
  assert.equal(project.link, undefined);
  assert.equal(
    project.result,
    "Created a cleaner post purchase follow up system with organized buyer tracking, timely communication, and smoother campaign backend support.",
  );
  assert.match(project.caseStudy.challenge, /post purchase communication flow/i);
  assert.match(project.caseStudy.approach, /n8n wishlist step/i);
  assert.deepEqual(project.caseStudy.techStack, [
    "GoHighLevel",
    "n8n",
    "Email Automation",
    "SMS Automation",
    "CRM Tags",
    "Payment Trigger Workflows",
  ]);
});

test("buyer follow-up automation is prioritized in the CRM automation tab", async () => {
  const source = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");

  assert.match(
    source,
    /const automationSpotlightIds = \[[\s\S]*?"ghl-buyer-follow-up-automation"[\s\S]*?\];/,
  );
});

test("Phantom opt-in tracker is prioritized in the CRM automation tab", async () => {
  const source = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");

  assert.match(
    source,
    /const automationSpotlightIds = \[[\s\S]*?"ghl-phantom-optin-tracker"[\s\S]*?\];/,
  );
});

test("selected-work cards replace metrics only when performance proof exists", async () => {
  const source = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");

  assert.match(source, /function ProjectPerformanceProof\(\{ project \}\)/);
  assert.match(source, /getShowcaseMeta\(project\)\.outcome \?\? project\.result \?\?/);
  assert.match(source, /<details className="project-performance-proof">/);
  assert.match(source, /project\.proofImage \? \(\s*<ProjectPerformanceProof project=\{project\} \/>/);
  assert.match(source, /:\s*\(\s*<div\s+className="work-feature-card__metrics"/);
  assert.match(source, /:\s*\(\s*<div\s+className="project-metrics project-metrics--compact"/);
});

test("performance proof styles support readable inline expansion", async () => {
  const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.match(css, /\.project-performance-proof__preview/);
  assert.match(css, /\.project-performance-proof__viewport/);
  assert.match(css, /\.project-performance-proof summary:focus-visible/);
  assert.match(css, /\.project-performance-proof\[open\]/);
  assert.match(
    css,
    /\.work-feature-card:has\(\.project-performance-proof\[open\]\) \{\s*grid-template-columns: 1fr;\s*\}/,
  );
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*?\.project-performance-proof__expanded/);
});
