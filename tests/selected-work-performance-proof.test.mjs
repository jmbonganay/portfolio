import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { projects } from "../src/data/projects.js";

test("exactly seven selected-work projects provide performance proof images", () => {
  const proofProjects = projects.filter((project) => project.proofImage);

  assert.equal(proofProjects.length, 7);
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
    ],
  );
});

test("selected-work cards replace metrics only when performance proof exists", async () => {
  const source = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");

  assert.match(source, /function ProjectPerformanceProof\(\{ project \}\)/);
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
