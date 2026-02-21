import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Ensure a single React instance so CAFProvider (from @c-a-f/infrastructure-react) and the app share the same React
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  test: {
    environment: 'happy-dom',
    include: ['**/*.spec.ts', '**/*.spec.tsx'],
    globals: false,
    setupFiles: ['./vitest.setup.ts'],
  },
});
