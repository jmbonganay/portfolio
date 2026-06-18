let analyticsInitialized = false;

export function initializeAnalytics({ consent, measurementId, analytics }) {
  if (
    analyticsInitialized ||
    consent !== "granted" ||
    !measurementId ||
    !analytics
  ) {
    return false;
  }

  analytics.initialize(measurementId);
  analytics.send({
    hitType: "pageview",
    page: globalThis.location?.pathname || "/",
  });
  analyticsInitialized = true;
  return true;
}

export function resetAnalyticsInitializationForTests() {
  analyticsInitialized = false;
}
