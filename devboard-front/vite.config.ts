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
      reporter: ["text", "lcov"],
      include: ["src/**"],
      exclude: [
        "src/tests/**",
        "src/main.tsx",
        "src/vite-env.d.ts",
        "src/styles/**",
        "src/i18n/**",
        "src/shared/types/**",
        "src/shared/components/ui/**",
        "src/api/model/**",
        "src/api/services/generated/**",
        "src/app/providers.tsx",
        "src/app/router.tsx",
      ],
    },
  },
});
