import { defineConfig } from "vitest/config";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  optimizeDeps: {
    include: ["dom-accessibility-api"],
  },
  test: {
    environment: "happy-dom",
    include: ["**/*.spec.ts", "**/*.spec.tsx"],
    setupFiles: [resolve(__dirname, "./vitest.setup.ts")],
    globals: true,
    deps: {
      optimizer: {
        web: {
          include: ["dom-accessibility-api"],
        },
      },
    },
  },
  resolve: {
    alias: {
      // Force resolution from workspace root node_modules
      "@testing-library/dom": resolve(__dirname, "../../../node_modules/@testing-library/dom"),
    },
    conditions: ["import", "module", "node", "default"],
  },
});
