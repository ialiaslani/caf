import { describe, it, expect, vi } from 'vitest';
import { UseCase } from '../src/UseCase/UseCase';
import type { RequestResult } from '../src/IRequest/IRequest';
import { pulse } from '../src/Pulse';

describe('UseCase interface', () => {
  describe('interface contract', () => {
    it('should allow implementation with correct signature', async () => {
      const useCase: UseCase<[], string> = {
        execute: async () => ({
          loading: pulse(false),
          data: pulse('result'),
          error: pulse(null! as Error),
        }),
      };

      const result = await useCase.execute();
      expect(result.data.value).toBe('result');
      expect(result.loading.value).toBe(false);
    });

    it('should allow implementation with arguments', async () => {
      const useCase: UseCase<[string, number], string> = {
        execute: async (name: string, age: number) => ({
          loading: pulse(false),
          data: pulse(`${name} is ${age}`),
          error: pulse(null! as Error),
        }),
      };

      const result = await useCase.execute('John', 30);
      expect(result.data.value).toBe('John is 30');
    });

    it('should allow implementation with complex arguments', async () => {
      interface User {
        id: number;
        name: string;
      }

      const useCase: UseCase<[User], User> = {
        execute: async (user: User) => ({
          loading: pulse(false),
          data: pulse({ ...user, id: user.id + 1 }),
          error: pulse(null! as Error),
        }),
      };

      const result = await useCase.execute({ id: 1, name: 'Alice' });
      expect(result.data.value).toEqual({ id: 2, name: 'Alice' });
    });

    it('should allow implementation with no arguments', async () => {
      const useCase: UseCase<[], number> = {
        execute: async () => ({
          loading: pulse(false),
          data: pulse(42),
          error: pulse(null! as Error),
        }),
      };

      const result = await useCase.execute();
      expect(result.data.value).toBe(42);
    });
  });

  describe('RequestResult structure', () => {
    it('should return RequestResult with loading, data, and error', async () => {
      const useCase: UseCase<[], string> = {
        execute: async () => ({
          loading: pulse(false),
          data: pulse('data'),
          error: pulse(null! as Error),
        }),
      };

      const result = await useCase.execute();

      expect(result).toHaveProperty('loading');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
      // Pulse uses a Proxy, so we check for value access rather than property existence
      expect(result.loading.value).toBeDefined();
      expect(result.data.value).toBeDefined();
      expect(result.error.value).toBeDefined();
    });

    it('should handle loading state', async () => {
      const useCase: UseCase<[], string> = {
        execute: async () => {
          const loading = pulse(true);
          const data = pulse('result');
          const error = pulse(null! as Error);
          
          // Simulate async operation
          await new Promise(resolve => setTimeout(resolve, 10));
          loading.value = false;
          
          return { loading, data, error };
        },
      };

      const result = await useCase.execute();
      expect(result.loading.value).toBe(false);
    });

    it('should handle error state', async () => {
      const error = new Error('Failed');
      const useCase: UseCase<[], string> = {
        execute: async () => ({
          loading: pulse(false),
          data: pulse(null! as string),
          error: pulse(error),
        }),
      };

      const result = await useCase.execute();
      expect(result.error.value).toBe(error);
      expect(result.data.value).toBeNull();
    });
  });

  describe('concrete implementations', () => {
    class GetUsersUseCase implements UseCase<[], string[]> {
      async execute(): Promise<RequestResult<string[]>> {
        return {
          loading: pulse(false),
          data: pulse(['user1', 'user2']),
          error: pulse(null! as Error),
        };
      }
    }

    class CreateUserUseCase implements UseCase<[{ name: string }], { id: number; name: string }> {
      async execute(user: { name: string }): Promise<RequestResult<{ id: number; name: string }>> {
        return {
          loading: pulse(false),
          data: pulse({ id: 1, name: user.name }),
          error: pulse(null! as Error),
        };
      }
    }

    it('should work with class implementation', async () => {
      const useCase = new GetUsersUseCase();
      const result = await useCase.execute();

      expect(result.data.value).toEqual(['user1', 'user2']);
    });

    it('should work with class implementation with arguments', async () => {
      const useCase = new CreateUserUseCase();
      const result = await useCase.execute({ name: 'John' });

      expect(result.data.value).toEqual({ id: 1, name: 'John' });
    });
  });

  describe('error handling', () => {
    it('should allow use case to return error', async () => {
      const error = new Error('Operation failed');
      const useCase: UseCase<[], string> = {
        execute: async () => ({
          loading: pulse(false),
          data: pulse(null! as string),
          error: pulse(error),
        }),
      };

      const result = await useCase.execute();
      expect(result.error.value).toBe(error);
    });

    it('should allow use case to throw', async () => {
      const useCase: UseCase<[], string> = {
        execute: async () => {
          throw new Error('Thrown error');
        },
      };

      await expect(useCase.execute()).rejects.toThrow('Thrown error');
    });
  });

  describe('async behavior', () => {
    it('should handle async operations', async () => {
      const useCase: UseCase<[], string> = {
        execute: async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
          return {
            loading: pulse(false),
            data: pulse('async-result'),
            error: pulse(null! as Error),
          };
        },
      };

      const result = await useCase.execute();
      expect(result.data.value).toBe('async-result');
    });

    it('should handle multiple concurrent executions', async () => {
      let callCount = 0;
      const useCase: UseCase<[], number> = {
        execute: async () => {
          callCount++;
          return {
            loading: pulse(false),
            data: pulse(callCount),
            error: pulse(null! as Error),
          };
        },
      };

      const [result1, result2, result3] = await Promise.all([
        useCase.execute(),
        useCase.execute(),
        useCase.execute(),
      ]);

      expect(result1.data.value).toBeGreaterThan(0);
      expect(result2.data.value).toBeGreaterThan(0);
      expect(result3.data.value).toBeGreaterThan(0);
    });
  });

  describe('type safety', () => {
    it('should enforce correct return type', async () => {
      const useCase: UseCase<[number], number> = {
        execute: async (n: number) => {
          // TypeScript should enforce that return type matches
          return {
            loading: pulse(false),
            data: pulse(n * 2),
            error: pulse(null! as Error),
          };
        },
      };

      const result = await useCase.execute(5);
      expect(result.data.value).toBe(10);
    });

    it('should enforce correct argument types', () => {
      const useCase: UseCase<[string], string> = {
        execute: async (str: string) => {
          // TypeScript should enforce that str is string
          return {
            loading: pulse(false),
            data: pulse(str.toUpperCase()),
            error: pulse(null! as Error),
          };
        },
      };

      // This should compile without errors
      expect(useCase.execute).toBeDefined();
    });
  });
});
