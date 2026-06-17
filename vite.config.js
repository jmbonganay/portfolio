import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import automationLeadHandler from "./api/automation-lead.js";

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

  for (const key of ["MAKE_WEBHOOK_URL", "MAKE_WEBHOOK_SECRET"]) {
    if (env[key] && !process.env[key]) {
      process.env[key] = env[key];
    }
  }

  return {
    plugins: [react(), automationLeadDevApiPlugin()],
    build: {
      target: "es2018",
      minify: "esbuild",
      cssMinify: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
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
