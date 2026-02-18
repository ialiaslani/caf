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
        inline: [
          /dom-accessibility-api/,
          /@testing-library\/dom/,
          /@testing-library\/react/,
        ],
      },
    },
  },
  optimizeDeps: {
    include: [
      "dom-accessibility-api",
      "@testing-library/dom",
      "@testing-library/react",
    ],
  },
  resolve: {
    conditions: ["import", "module", "node", "default"],
  },
});
