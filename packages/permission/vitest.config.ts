import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node' as const,
    include: ['**/*.spec.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['**/*.spec.ts', '**/index.ts', 'node_modules'],
    },
  },
});
