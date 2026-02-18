export default {
  test: {
    environment: 'node' as const,
    include: ['**/*.spec.ts'],
    testTimeout: 30000, // 30 second timeout for all tests to prevent hanging
    hookTimeout: 10000, // 10 second timeout for hooks (beforeEach/afterEach)
  },
};
