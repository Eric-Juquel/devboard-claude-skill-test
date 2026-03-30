import { defineConfig } from "orval";

export default defineConfig({
  devboard: {
    input: {
      target: "../devboard-back/openapi.yaml",
    },
    output: {
      mode: "tags",
      target: "src/api/services/generated",
      schemas: "src/api/model",
      client: "axios",
      mock: false,
      override: {
        mutator: {
          path: "./src/api/client/orval-mutator.ts",
          name: "orvalMutator",
        },
      },
    },
  },
});
