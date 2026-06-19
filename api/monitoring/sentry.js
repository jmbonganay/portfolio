import * as Sentry from "@sentry/node";

import { sanitizeSentryEvent } from "../../monitoring/sanitize.js";

const initializedSdks = new WeakSet();

function resolveEnvironment(value) {
  const environment = String(value || "").trim().toLowerCase();
  return environment === "preview" || environment === "production"
    ? environment
    : "";
}

export function createSentryReporter({ env = {}, sentry }) {
  const environment = resolveEnvironment(env.VERCEL_ENV);
  const enabled = Boolean(env.SENTRY_DSN && environment && sentry);

  if (enabled && !initializedSdks.has(sentry)) {
    try {
      sentry.init({
        dsn: env.SENTRY_DSN,
        environment,
        release: env.VERCEL_GIT_COMMIT_SHA || undefined,
        sampleRate: 1,
        sendDefaultPii: false,
        tracesSampleRate: 0,
        maxBreadcrumbs: 30,
        maxValueLength: 500,
        beforeSend: sanitizeSentryEvent,
      });
      initializedSdks.add(sentry);
    } catch {
      return async () => false;
    }
  }

  return async function reportError({ error, stage, submissionType } = {}) {
    if (!enabled || !initializedSdks.has(sentry) || !error) return false;

    try {
      sentry.captureException(error, {
        tags: {
          service: "automation-lead",
          stage: stage || "unknown",
          submission_type: submissionType || "unknown",
        },
      });
      await sentry.flush(300);
      return true;
    } catch {
      return false;
    }
  };
}

export const reportServerError = createSentryReporter({
  env: process.env,
  sentry: Sentry,
});
