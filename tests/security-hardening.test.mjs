import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function readProjectFile(pathname) {
  return readFile(new URL(`../${pathname}`, import.meta.url), "utf8");
}

test("development tooling uses the patched esbuild release", async () => {
  const packageJson = JSON.parse(await readProjectFile("package.json"));

  assert.equal(packageJson.packageManager, "npm@11.13.0");
  assert.equal(packageJson.devDependencies.esbuild, "^0.28.1");
  assert.equal(packageJson.devDependencies.vite, "^8.0.16");
  assert.equal(packageJson.devDependencies["@vitejs/plugin-react"], "^6.0.2");
});

test("the hCaptcha client identifier remains environment-only", async () => {
  const appSource = await readProjectFile("src/App.jsx");
  const setupGuide = await readProjectFile("SECURITY_ENV_SETUP.md");

  assert.match(
    appSource,
    /const HCAPTCHA_SITE_KEY = import\.meta\.env\.VITE_HCAPTCHA_SITE_KEY \|\| "";/,
  );
  assert.doesNotMatch(setupGuide, /includes working fallbacks/i);
});

test("Vercel security headers retain the hardening baseline", async () => {
  const configuration = JSON.parse(await readProjectFile("vercel.json"));
  const headers = new Map(
    configuration.headers[0].headers.map(({ key, value }) => [key, value]),
  );
  const contentSecurityPolicy = headers.get("Content-Security-Policy") || "";

  assert.equal(headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(headers.get("X-Frame-Options"), "DENY");
  assert.equal(headers.has("X-XSS-Protection"), false);
  assert.equal(
    headers.get("Cross-Origin-Opener-Policy"),
    "same-origin-allow-popups",
  );
  assert.equal(headers.get("Cross-Origin-Resource-Policy"), "same-origin");
  assert.match(contentSecurityPolicy, /script-src-attr 'none'/);
  assert.match(contentSecurityPolicy, /frame-ancestors 'none'/);
  assert.match(contentSecurityPolicy, /object-src 'none'/);
  assert.doesNotMatch(contentSecurityPolicy, /web3forms/i);
});

test("analytics is consent-gated and privacy preferences remain accessible", async () => {
  const mainSource = await readProjectFile("src/main.jsx");
  const appSource = await readProjectFile("src/App.jsx");
  const consentSource = await readProjectFile("src/components/PrivacyConsent.jsx");
  const styles = await readProjectFile("src/styles.css");

  assert.doesNotMatch(mainSource, /ReactGA\.initialize|ReactGA\.send/);
  assert.match(appSource, /PrivacyConsent/);
  assert.match(appSource, /Privacy preferences/);
  assert.match(consentSource, /role="region"/);
  assert.match(consentSource, /Decline/);
  assert.match(consentSource, /Allow analytics/);
  assert.match(consentSource, /Google Analytics 4/);
  assert.match(consentSource, /hCaptcha/);
  assert.match(consentSource, /Upstash/);
  assert.match(consentSource, /Make/);
  assert.match(consentSource, /Gmail/);
  assert.match(consentSource, /Google Sheets/);
  assert.match(styles, /\.privacy-consent__button[\s\S]*min-height:\s*44px/);
  assert.match(styles, /@media \(max-width:\s*720px\)[\s\S]*\.privacy-consent__actions/);
});

test("outbound project links are restricted to HTTPS", async () => {
  const sources = await Promise.all([
    readProjectFile("src/App.jsx"),
    readProjectFile("src/components/AutomationModal.jsx"),
  ]);

  for (const source of sources) {
    assert.match(
      source,
      /return url\.protocol === "https:" \? url\.href : "";/,
    );
    assert.doesNotMatch(source, /url\.protocol === "http:"/);
  }
});

test("both forms use the verified same-origin submission gateway", async () => {
  const appSource = await readProjectFile("src/App.jsx");
  const automationSource = await readProjectFile("src/components/AutomationModal.jsx");

  assert.doesNotMatch(appSource, /api\.web3forms\.com|WEB3FORMS_ACCESS_KEY/);
  assert.match(appSource, /captchaToken,/);
  assert.match(appSource, /fetch\(AUTOMATION_LEAD_ENDPOINT/);
  assert.match(automationSource, /import HCaptcha from "@hcaptcha\/react-hcaptcha"/);
  assert.match(automationSource, /<HCaptcha/);
  assert.match(automationSource, /captchaToken,/);
  assert.match(automationSource, /fetch\(AUTOMATION_LEAD_ENDPOINT/);
});
