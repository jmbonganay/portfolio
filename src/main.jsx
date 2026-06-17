import React from "react";
import ReactDOM from "react-dom/client";
import ReactGA from "react-ga4";
import App from "./App.jsx";
import "./styles.css";

const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID || "";

if (GA4_MEASUREMENT_ID) {
  ReactGA.initialize(GA4_MEASUREMENT_ID);

  ReactGA.send({
    hitType: "pageview",
    page: window.location.pathname,
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
