import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const configSource = await readFile(
  new URL("../vite.config.js", import.meta.url),
  "utf8",
);
const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);

test("uses the official Sentry Vite plugin as a build-only dependency", () => {
  assert.ok(packageJson.dependencies["@sentry/node"]);
  assert.ok(packageJson.devDependencies["@sentry/vite-plugin"]);
  assert.match(
    configSource,
    /import \{ sentryVitePlugin \} from "@sentry\/vite-plugin";/,
  );
  assert.match(configSource, /id\.includes\("node_modules\/@sentry"\)/);
  assert.match(configSource, /return "monitoring"/);
});

test("requires all server-only upload credentials before enabling source maps", () => {
  assert.match(
    configSource,
    /SENTRY_AUTH_TOKEN[\s\S]*SENTRY_ORG[\s\S]*SENTRY_PROJECT/,
  );
  assert.match(
    configSource,
    /sourcemap:\s*sentryUploadConfigured \? "hidden" : false/,
  );
  assert.match(configSource, /sentryUploadConfigured \?/);
  assert.match(configSource, /filesToDeleteAfterUpload:\s*\["\.\/dist\/\*\*\/\*\.map"\]/);
  assert.match(configSource, /telemetry:\s*false/);
});

test("injects only safe environment and release metadata into the client", () => {
  assert.match(configSource, /VITE_SENTRY_ENVIRONMENT/);
  assert.match(configSource, /VITE_SENTRY_RELEASE/);
  assert.match(configSource, /VERCEL_ENV/);
  assert.match(configSource, /VERCEL_GIT_COMMIT_SHA/);
  assert.doesNotMatch(configSource, /VITE_SENTRY_AUTH_TOKEN/);
});

test("forwards every required local form API variable into the server process", () => {
  for (const variable of [
    "HCAPTCHA_SECRET_KEY",
    "VITE_HCAPTCHA_SITE_KEY",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "MAKE_WEBHOOK_URL",
    "MAKE_WEBHOOK_SECRET",
  ]) {
    assert.match(configSource, new RegExp(`"${variable}"`));
  }
});
