import { useEffect, useState } from "react";
import ReactGA from "react-ga4";

import {
  readAnalyticsConsent,
  writeAnalyticsConsent,
} from "../privacy/analytics-consent";
import { initializeAnalytics } from "../privacy/analytics";

const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID || "";

function getStoredConsent() {
  if (typeof window === "undefined") return null;
  return readAnalyticsConsent(window.localStorage);
}

export default function PrivacyConsent({ forceOpen = false, onClose }) {
  const [consent, setConsent] = useState(getStoredConsent);

  useEffect(() => {
    initializeAnalytics({
      consent,
      measurementId: GA4_MEASUREMENT_ID,
      analytics: ReactGA,
    });
  }, [consent]);

  function chooseConsent(value) {
    const stored = writeAnalyticsConsent(window.localStorage, value);
    setConsent(stored ? value : null);
    if (stored) onClose?.();
  }

  if (consent && !forceOpen) return null;

  return (
    <aside
      className="privacy-consent"
      role="region"
      aria-labelledby="privacy-consent-title"
    >
      <div className="privacy-consent__copy">
        <strong id="privacy-consent-title">Privacy choices</strong>
        <p>
          Essential security and form services always run. Google Analytics 4
          runs only when you allow analytics.
        </p>
        <details>
          <summary>Privacy notice</summary>
          <p>
            hCaptcha helps prevent abuse; Upstash applies request limits; Make,
            Gmail, and Google Sheets process form submissions and replies. Google
            Analytics 4 measures site use only with consent. Sentry provides
            essential error monitoring in Preview and Production; default PII,
            session replay, and submitted form contents are disabled. Do not
            submit sensitive personal information through the forms.
          </p>
        </details>
      </div>

      <div className="privacy-consent__actions" aria-label="Analytics choices">
        <button
          className="privacy-consent__button privacy-consent__button--secondary"
          type="button"
          onClick={() => chooseConsent("denied")}
        >
          Decline
        </button>
        <button
          className="privacy-consent__button privacy-consent__button--primary"
          type="button"
          onClick={() => chooseConsent("granted")}
        >
          Allow analytics
        </button>
      </div>
    </aside>
  );
}
