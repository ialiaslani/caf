import { describe, it, expect, vi } from 'vitest';
import {
  createMockUseCase,
  createMockUseCaseSuccess,
  createMockUseCaseError,
  createMockUseCaseAsync,
  createUseCaseTester,
  createSuccessResult,
  createErrorResult,
} from '../../src/core/UseCaseTestHelpers';

describe('UseCaseTestHelpers', () => {
  describe('createMockUseCaseSuccess', () => {
    it('should create a use case that returns success', async () => {
      const useCase = createMockUseCaseSuccess({ id: '1', name: 'John' });
      const result = await useCase.execute();

      expect(result.data.value).toEqual({ id: '1', name: 'John' });
      expect(result.error.value).toBeNull();
      expect(result.loading.value).toBe(false);
    });

    it('should work with primitive data', async () => {
      const useCase = createMockUseCaseSuccess(42);
      const result = await useCase.execute();
      expect(result.data.value).toBe(42);
    });

    it('should work with array data', async () => {
      const useCase = createMockUseCaseSuccess([1, 2, 3]);
      const result = await useCase.execute();
      expect(result.data.value).toEqual([1, 2, 3]);
    });
  });

  describe('createMockUseCaseError', () => {
    it('should create a use case that returns error', async () => {
      const error = new Error('Network failed');
      const useCase = createMockUseCaseError(error);
      const result = await useCase.execute();

      expect(result.error.value).toBe(error);
      expect(result.data.value).toBeNull();
      expect(result.loading.value).toBe(false);
    });

    it('should preserve error message', async () => {
      const error = new Error('Custom error message');
      const useCase = createMockUseCaseError(error);
      const result = await useCase.execute();
      expect(result.error.value?.message).toBe('Custom error message');
    });
  });

  describe('createMockUseCaseAsync', () => {
    it('should resolve immediately when delay is 0', async () => {
      const useCase = createMockUseCaseAsync({ id: '1' }, 0);
      const result = await useCase.execute();
      expect(result.data.value).toEqual({ id: '1' });
    });

    it('should resolve after delay', async () => {
      const start = Date.now();
      const useCase = createMockUseCaseAsync({ id: '1' }, 50);
      const result = await useCase.execute();
      const elapsed = Date.now() - start;

      expect(result.data.value).toEqual({ id: '1' });
      expect(elapsed).toBeGreaterThanOrEqual(45); // Allow some margin
    });

    it('should default to 0 delay', async () => {
      const useCase = createMockUseCaseAsync({ id: '1' });
      const result = await useCase.execute();
      expect(result.data.value).toEqual({ id: '1' });
    });
  });

  describe('createMockUseCase (enhanced)', () => {
    it('should work with custom implementation', async () => {
      const useCase = createMockUseCase<[number], number>((count) =>
        createSuccessResult(count * 2)
      );

      const result = await useCase.execute(5);
      expect(result.data.value).toBe(10);
    });

    it('should work with async implementation', async () => {
      const useCase = createMockUseCase<[], string>(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return createSuccessResult('async result');
      });

      const result = await useCase.execute();
      expect(result.data.value).toBe('async result');
    });

    it('should handle error results', async () => {
      const error = new Error('Test error');
      const useCase = createMockUseCase<[], void>(() =>
        createErrorResult(error)
      );

      const result = await useCase.execute();
      expect(result.error.value).toBe(error);
    });
  });

  describe('UseCaseTester with new helpers', () => {
    it('should test success use case', async () => {
      const useCase = createMockUseCaseSuccess({ id: '1' });
      const tester = createUseCaseTester(useCase);

      const result = await tester.execute([]);
      expect(result.data.value).toEqual({ id: '1' });
    });

    it('should test error use case', async () => {
      const error = new Error('Failed');
      const useCase = createMockUseCaseError(error);
      const tester = createUseCaseTester(useCase);

      const result = await tester.execute([]);
      expect(result.error.value).toBe(error);
    });

    it('should execute and get data', async () => {
      const useCase = createMockUseCaseSuccess({ name: 'Test' });
      const tester = createUseCaseTester(useCase);

      const data = await tester.executeAndGetData([]);
      expect(data).toEqual({ name: 'Test' });
    });

    it('should throw when executeAndGetData gets error', async () => {
      const error = new Error('Failed');
      const useCase = createMockUseCaseError(error);
      const tester = createUseCaseTester(useCase);

      await expect(tester.executeAndGetData([])).rejects.toBe(error);
    });

    it('should check success', async () => {
      const successUseCase = createMockUseCaseSuccess({});
      const errorUseCase = createMockUseCaseError(new Error('Failed'));
      const successTester = createUseCaseTester(successUseCase);
      const errorTester = createUseCaseTester(errorUseCase);

      expect(await successTester.executeAndCheckSuccess([])).toBe(true);
      expect(await errorTester.executeAndCheckSuccess([])).toBe(false);
    });

    it('should timeout on long-running use case', async () => {
      const useCase = createMockUseCaseAsync({ id: '1' }, 200);
      const tester = createUseCaseTester(useCase);

      await expect(tester.execute([], { timeout: 50 })).rejects.toThrow(
        /timeout/i
      );
    });
  });
});
