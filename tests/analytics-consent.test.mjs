import assert from "node:assert/strict";
import test from "node:test";

import {
  ANALYTICS_CONSENT_KEY,
  clearAnalyticsConsent,
  readAnalyticsConsent,
  writeAnalyticsConsent,
} from "../src/privacy/analytics-consent.js";
import {
  initializeAnalytics,
  resetAnalyticsInitializationForTests,
} from "../src/privacy/analytics.js";

function memoryStorage(initialValue) {
  const values = new Map();
  if (initialValue !== undefined) values.set(ANALYTICS_CONSENT_KEY, initialValue);
  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

test("reads only explicit granted or denied consent", () => {
  assert.equal(readAnalyticsConsent(memoryStorage()), null);
  assert.equal(readAnalyticsConsent(memoryStorage("granted")), "granted");
  assert.equal(readAnalyticsConsent(memoryStorage("denied")), "denied");
  assert.equal(readAnalyticsConsent(memoryStorage("unexpected")), null);
});

test("fails closed when storage cannot be read or written", () => {
  const brokenStorage = {
    getItem() {
      throw new Error("blocked");
    },
    setItem() {
      throw new Error("blocked");
    },
    removeItem() {
      throw new Error("blocked");
    },
  };

  assert.equal(readAnalyticsConsent(brokenStorage), null);
  assert.equal(writeAnalyticsConsent(brokenStorage, "granted"), false);
  assert.equal(clearAnalyticsConsent(brokenStorage), false);
});

test("persists a choice and can clear it to reopen preferences", () => {
  const storage = memoryStorage();
  assert.equal(writeAnalyticsConsent(storage, "granted"), true);
  assert.equal(readAnalyticsConsent(storage), "granted");
  assert.equal(clearAnalyticsConsent(storage), true);
  assert.equal(readAnalyticsConsent(storage), null);
  assert.equal(writeAnalyticsConsent(storage, "invalid"), false);
});

test("initializes and sends GA4 once only after a valid grant", () => {
  resetAnalyticsInitializationForTests();
  const calls = [];
  const analytics = {
    initialize(id) {
      calls.push(["initialize", id]);
    },
    send(payload) {
      calls.push(["send", payload]);
    },
  };

  assert.equal(
    initializeAnalytics({ consent: null, measurementId: "G-TEST", analytics }),
    false,
  );
  assert.equal(
    initializeAnalytics({ consent: "denied", measurementId: "G-TEST", analytics }),
    false,
  );
  assert.equal(
    initializeAnalytics({ consent: "granted", measurementId: "", analytics }),
    false,
  );
  assert.equal(
    initializeAnalytics({ consent: "granted", measurementId: "G-TEST", analytics }),
    true,
  );
  assert.equal(
    initializeAnalytics({ consent: "granted", measurementId: "G-TEST", analytics }),
    false,
  );
  assert.deepEqual(calls, [
    ["initialize", "G-TEST"],
    ["send", { hitType: "pageview", page: "/" }],
  ]);
});
