import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import automationLeadHandler from "./api/automation-lead.js";

const LOCAL_API_ENV_KEYS = [
  "HCAPTCHA_SECRET_KEY",
  "VITE_HCAPTCHA_SITE_KEY",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "MAKE_WEBHOOK_URL",
  "MAKE_WEBHOOK_SECRET",
];

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });

    request.on("end", () => {
      resolve(body);
    });

    request.on("error", reject);
  });
}

function createJsonResponse(response) {
  return {
    setHeader: response.setHeader.bind(response),
    status(statusCode) {
      response.statusCode = statusCode;

      return {
        json(payload) {
          if (!response.headersSent) {
            response.setHeader("Content-Type", "application/json; charset=utf-8");
          }

          response.end(JSON.stringify(payload));
        },
      };
    },
  };
}

function automationLeadDevApiPlugin() {
  return {
    name: "portfolio-automation-lead-dev-api",
    configureServer(server) {
      server.middlewares.use("/api/automation-lead", async (request, response) => {
        try {
          request.body = await readRequestBody(request);
          await automationLeadHandler(request, createJsonResponse(response));
        } catch (error) {
          console.error("Local automation lead API failed:", error);

          if (!response.writableEnded) {
            response.statusCode = 500;
            response.setHeader("Content-Type", "application/json; charset=utf-8");
            response.end(JSON.stringify({ error: "Local automation API failed" }));
          }
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN || env.SENTRY_AUTH_TOKEN;
  const sentryOrg = process.env.SENTRY_ORG || env.SENTRY_ORG;
  const sentryProject = process.env.SENTRY_PROJECT || env.SENTRY_PROJECT;
  const sentryUploadConfigured = [
    sentryAuthToken,
    sentryOrg,
    sentryProject,
  ].every(Boolean);
  const sentryEnvironment = process.env.VERCEL_ENV || "";
  const sentryRelease = process.env.VERCEL_GIT_COMMIT_SHA || "";

  for (const key of LOCAL_API_ENV_KEYS) {
    if (env[key] && !process.env[key]) {
      process.env[key] = env[key];
    }
  }

  return {
    define: {
      "import.meta.env.VITE_SENTRY_ENVIRONMENT": JSON.stringify(sentryEnvironment),
      "import.meta.env.VITE_SENTRY_RELEASE": JSON.stringify(sentryRelease),
    },
    plugins: [
      react(),
      automationLeadDevApiPlugin(),
      sentryUploadConfigured
        ? sentryVitePlugin({
            authToken: sentryAuthToken,
            org: sentryOrg,
            project: sentryProject,
            telemetry: false,
            sourcemaps: {
              filesToDeleteAfterUpload: ["./dist/**/*.map"],
            },
          })
        : null,
    ].filter(Boolean),
    build: {
      target: "es2018",
      minify: "esbuild",
      cssMinify: true,
      sourcemap: sentryUploadConfigured ? "hidden" : false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/@sentry")) {
              return "monitoring";
            }

            if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
              return "react-vendor";
            }

            if (id.includes("node_modules/lucide-react")) {
              return "icons";
            }

            if (id.includes("node_modules/react-ga4")) {
              return "analytics";
            }

            if (id.includes("src/components/CroSlider")) {
              return "cro-slider";
            }

            if (id.includes("src/components/AboutMetrics")) {
              return "about-metrics";
            }
          },
        },
      },
      chunkSizeWarningLimit: 700,
    },
  };
});
