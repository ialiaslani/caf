export default {
  test: {
    environment: 'happy-dom',
    include: ['**/*.spec.ts', '**/*.spec.tsx'],
    setupFiles: ['./vitest.setup.ts'],
  },
};
