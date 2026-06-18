import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  contactCopy,
  contactProjectTypes,
  contactTrustSignals,
  getFirstInvalidContactField,
} from "../src/data/contact.js";

test("contact content prioritizes project inquiries", () => {
  assert.equal(contactCopy.eyebrow, "Start a conversation");
  assert.equal(contactCopy.headline, "Tell me what you need to launch.");
  assert.equal(contactCopy.submitLabel, "Send project details");
  assert.deepEqual(contactProjectTypes, [
    "Landing page",
    "Website or store",
    "Automation",
    "Remote role",
  ]);
});

test("contact trust signals stay concise", () => {
  assert.deepEqual(contactTrustSignals, [
    "Usually replies within 24 hours",
    "Design, build, QA, and handoff support",
    "Remote ready with US, UK, and AU overlap",
  ]);
});

test("invalid contact fields follow visual form order", () => {
  assert.equal(getFirstInvalidContactField({ email: "Invalid" }), "email");
  assert.equal(
    getFirstInvalidContactField({ message: "Too short", name: "Required" }),
    "name",
  );
  assert.equal(getFirstInvalidContactField({}), null);
});

test("contact markup uses the approved project-first structure", async () => {
  const source = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");

  assert.match(source, /className="contact-primary-fields"/);
  assert.match(source, /className="contact-security-row"/);
  assert.match(source, /className="contact-email-actions"/);
  assert.match(source, /contactCopy\.headline/);
  assert.match(source, /contactCopy\.submitLabel/);
});

test("contact styles include desktop and mobile project-first layouts", async () => {
  const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.match(css, /CONTACT — PROJECT FIRST CONVERSION PASS/);
  assert.match(css, /\.contact-primary-fields/);
  assert.match(css, /\.contact-security-row/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(
    css,
    /\.contact-card--project-first \.contact-direct \{[\s\S]*?grid-template-columns: 1fr;/,
  );
  assert.match(
    css,
    /\.contact-card--project-first \.contact-cta \{[\s\S]*?order: 0;/,
  );
  assert.match(
    css,
    /\.contact-card--project-first \.contact-form \{[\s\S]*?order: 1;/,
  );
  assert.match(css, /\.contact-captcha iframe \{[\s\S]*?width: 303px !important;/);
});

test("copy address stays compact and inset on desktop and mobile", async () => {
  const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.match(
    css,
    /\.contact-card--project-first \.contact-copy-action \{[\s\S]*?width: fit-content;[\s\S]*?min-height: 44px;[\s\S]*?margin: 8px 12px 8px 0;[\s\S]*?font-size: 0\.72rem;/,
  );
  assert.match(
    css,
    /@media \(max-width: 430px\) \{[\s\S]*?\.contact-card--project-first \.contact-copy-action \{[\s\S]*?justify-self: start;[\s\S]*?width: fit-content;[\s\S]*?margin: 0 12px 12px;/,
  );
  assert.match(
    css,
    /\.contact-card--project-first \.contact-direct strong \{[\s\S]*?font-size: 0\.76rem;[\s\S]*?white-space: nowrap;/,
  );
  assert.match(
    css,
    /@media \(min-width: 1081px\) and \(max-width: 1240px\) \{[\s\S]*?\.contact-email-actions \{[\s\S]*?grid-template-columns: 1fr;/,
  );
});
