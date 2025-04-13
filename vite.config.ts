import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Load Replit plugins
const loadReplitPlugins = () => {
  try {
    // Dynamic imports for Replit plugins
    const themePlugin = require("@replit/vite-plugin-shadcn-theme-json");
    const runtimeErrorOverlay = require("@replit/vite-plugin-runtime-error-modal");

    // Check if we're in a Replit environment
    const isReplitEnv = process.env.REPL_ID !== undefined;

    // Load cartographer plugin only in Replit environment
    let plugins = [themePlugin.default(), runtimeErrorOverlay.default()];

    if (isReplitEnv && process.env.NODE_ENV !== "production") {
      try {
        const cartographer = require("@replit/vite-plugin-cartographer");
        plugins.push(cartographer.cartographer());
      } catch (err) {
        console.warn("Cartographer plugin not available");
      }
    }

    return plugins;
  } catch (error) {
    console.warn("Replit plugins not available, skipping...");
    return [];
  }
};

export default defineConfig({
  plugins: [
    react(),
    ...loadReplitPlugins(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
});
