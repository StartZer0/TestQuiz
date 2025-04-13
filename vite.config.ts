import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Only import Replit plugins in development environment
const loadReplitPlugins = () => {
  if (process.env.NODE_ENV !== "production") {
    try {
      // Dynamic imports for Replit plugins
      const themePlugin = require("@replit/vite-plugin-shadcn-theme-json");
      const runtimeErrorOverlay = require("@replit/vite-plugin-runtime-error-modal");
      return [themePlugin.default(), runtimeErrorOverlay.default()];
    } catch (error) {
      console.warn("Replit plugins not available, skipping...");
      return [];
    }
  }
  return [];
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
