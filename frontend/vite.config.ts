import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "../shared"),
      "@config": path.resolve(__dirname, "./config"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
});
