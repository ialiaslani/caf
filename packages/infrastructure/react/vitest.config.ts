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
    deps: {
      optimizer: {
        web: {
          include: [
            "dom-accessibility-api",
            "@testing-library/dom",
            "@testing-library/react",
          ],
        },
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
  ssr: {
    noExternal: [
      "dom-accessibility-api",
      "@testing-library/dom",
      "@testing-library/react",
    ],
  },
  server: {
    deps: {
      inline: [
        /dom-accessibility-api/,
        /@testing-library\/dom/,
        /@testing-library\/react/,
      ],
    },
  },
  resolve: {
    alias: {
      // Force resolution from workspace root node_modules
      "@testing-library/dom": resolve(__dirname, "../../../node_modules/@testing-library/dom"),
      "@testing-library/react": resolve(__dirname, "../../../node_modules/@testing-library/react"),
      "dom-accessibility-api": resolve(__dirname, "../../../node_modules/dom-accessibility-api"),
    },
    conditions: ["import", "module", "node", "default"],
  },
});
