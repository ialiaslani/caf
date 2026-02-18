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
    conditions: ['import', 'module', 'node', 'default'],
  },
});
