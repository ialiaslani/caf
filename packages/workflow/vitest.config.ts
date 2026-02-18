import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    environment: 'node' as const,
    include: ['**/*.spec.ts'],
  },
  resolve: {
    alias: {
      // Fix ES module resolution for @c.a.f/core - resolve to the actual built file
      '@c.a.f/core': resolve(__dirname, '../../node_modules/@c.a.f/core/.build/src/index.js'),
    },
    conditions: ['import', 'module', 'default'],
  },
});
