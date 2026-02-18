import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node' as const,
    include: ['**/*.spec.ts'],
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
});
