import { defineConfig } from "vitest/config";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["**/*.spec.ts", "**/*.spec.tsx"],
    setupFiles: [resolve(__dirname, "./vitest.setup.ts")],
    globals: true,
    server: {
      deps: {
        inline: ["dom-accessibility-api", "@testing-library/dom"],
      },
    },
    deps: {
      optimizer: {
        include: ["dom-accessibility-api", "@testing-library/dom"],
      },
    },
  },
  resolve: {
    alias: {
      // Force resolution from workspace root node_modules
      "@testing-library/dom": resolve(__dirname, "../../../node_modules/@testing-library/dom"),
      "dom-accessibility-api": resolve(__dirname, "../../../node_modules/dom-accessibility-api"),
    },
    conditions: ["import", "module", "node", "default"],
  },
});
