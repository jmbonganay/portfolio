import {
  sanitizeSentryBreadcrumb,
  sanitizeSentryEvent,
} from "../../monitoring/sanitize.js";

const initializedSdks = new WeakSet();

export function resolveSentryEnvironment(value) {
  const environment = String(value || "").trim().toLowerCase();
  return environment === "preview" || environment === "production"
    ? environment
    : "";
}

export function initializeBrowserSentry({
  dsn,
  environment,
  release,
  sentry,
}) {
  const safeEnvironment = resolveSentryEnvironment(environment);
  if (!dsn || !safeEnvironment || !sentry || initializedSdks.has(sentry)) {
    return false;
  }

  try {
    sentry.init({
      dsn,
      environment: safeEnvironment,
      release: release || undefined,
      sampleRate: 1,
      sendDefaultPii: false,
      tracesSampleRate: 0,
      maxBreadcrumbs: 30,
      maxValueLength: 500,
      beforeSend: sanitizeSentryEvent,
      beforeBreadcrumb: sanitizeSentryBreadcrumb,
    });
    initializedSdks.add(sentry);
    return true;
  } catch {
    return false;
  }
}
