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
  },
  resolve: {
    alias: {
      // Force resolution from workspace root node_modules
      "@testing-library/dom": resolve(__dirname, "../../../node_modules/@testing-library/dom"),
      // Fix ES module resolution for @c.a.f/core - resolve to the actual built file
      "@c.a.f/core": resolve(__dirname, "../../../node_modules/@c.a.f/core/.build/src/index.js"),
    },
    conditions: ["import", "module", "default"],
  },
});
