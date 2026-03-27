import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/tests/setup.ts",
    globals: true,
    env: {
      VITE_API_BASE_URL: "http://localhost:3000",
    },
    coverage: {
      exclude: ["src/tests/**", "src/main.tsx", "src/i18n/**", "src/shared/types/**"],
    },
  },
  server: {
    watch: {
      ignored: ["**/db.json"],
    },
  },
});
