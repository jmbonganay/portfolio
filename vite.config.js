import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
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
});
