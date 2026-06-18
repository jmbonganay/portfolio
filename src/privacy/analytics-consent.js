export const ANALYTICS_CONSENT_KEY = "portfolio:analytics-consent:v1";

const VALID_CONSENT_VALUES = new Set(["granted", "denied"]);

export function readAnalyticsConsent(storage) {
  try {
    const value = storage?.getItem(ANALYTICS_CONSENT_KEY);
    return VALID_CONSENT_VALUES.has(value) ? value : null;
  } catch {
    return null;
  }
}

export function writeAnalyticsConsent(storage, value) {
  if (!VALID_CONSENT_VALUES.has(value)) return false;

  try {
    storage?.setItem(ANALYTICS_CONSENT_KEY, value);
    return Boolean(storage);
  } catch {
    return false;
  }
}

export function clearAnalyticsConsent(storage) {
  try {
    storage?.removeItem(ANALYTICS_CONSENT_KEY);
    return Boolean(storage);
  } catch {
    return false;
  }
}
