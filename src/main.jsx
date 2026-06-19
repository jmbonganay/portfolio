import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App.jsx";
import AppErrorFallback from "./components/AppErrorFallback.jsx";
import { initializeBrowserSentry } from "./monitoring/sentry-browser.js";
import "./styles.css";

initializeBrowserSentry({
  dsn: import.meta.env.VITE_SENTRY_DSN || "",
  environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || "",
  release: import.meta.env.VITE_SENTRY_RELEASE || "",
  sentry: Sentry,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<AppErrorFallback />}>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
