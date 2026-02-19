import { describe, it, expect, vi } from 'vitest';
import {
  createMockRepository,
  createMockRepositoryStub,
} from '../../src/core/RepositoryTestHelpers';

// Example repository interface for testing
interface IUserRepository {
  getUsers(): Promise<Array<{ id: string; name: string }>>;
  getUserById(id: string): Promise<{ id: string; name: string } | null>;
  createUser(user: { name: string }): Promise<{ id: string; name: string }>;
  updateUser(id: string, user: { name: string }): Promise<{ id: string; name: string }>;
  deleteUser(id: string): Promise<void>;
}

describe('RepositoryTestHelpers', () => {
  describe('createMockRepository', () => {
    it('should create a repository with provided methods', async () => {
      const repo = createMockRepository<IUserRepository>({
        getUsers: async () => [{ id: '1', name: 'John' }],
        getUserById: async (id) => ({ id, name: 'User ' + id }),
      });

      const users = await repo.getUsers();
      expect(users).toEqual([{ id: '1', name: 'John' }]);

      const user = await repo.getUserById('2');
      expect(user).toEqual({ id: '2', name: 'User 2' });
    });

    it('should return undefined for methods not provided', async () => {
      const repo = createMockRepository<IUserRepository>({
        getUsers: async () => [],
      });

      const result = await repo.getUserById('1');
      expect(result).toBeUndefined();
    });

    it('should work with partial implementation', async () => {
      const repo = createMockRepository<IUserRepository>({
        getUsers: async () => [{ id: '1', name: 'Test' }],
      });

      expect(await repo.getUsers()).toHaveLength(1);
      expect(await repo.getUserById('1')).toBeUndefined();
      expect(await repo.createUser({ name: 'New' })).toBeUndefined();
    });

    it('should handle methods with multiple parameters', async () => {
      const repo = createMockRepository<IUserRepository>({
        updateUser: async (id, user) => ({ id, name: user.name }),
      });

      const result = await repo.updateUser('1', { name: 'Updated' });
      expect(result).toEqual({ id: '1', name: 'Updated' });
    });

    it('should handle void return types', async () => {
      const repo = createMockRepository<IUserRepository>({
        deleteUser: async () => undefined,
      });

      const result = await repo.deleteUser('1');
      expect(result).toBeUndefined();
    });

    it('should work with empty object', async () => {
      const repo = createMockRepository<IUserRepository>({});

      expect(await repo.getUsers()).toBeUndefined();
      expect(await repo.getUserById('1')).toBeUndefined();
    });
  });

  describe('createMockRepositoryStub', () => {
    it('should create a stub that returns undefined for all methods', async () => {
      const stub = createMockRepositoryStub<IUserRepository>();

      expect(await stub.getUsers()).toBeUndefined();
      expect(await stub.getUserById('1')).toBeUndefined();
      expect(await stub.createUser({ name: 'Test' })).toBeUndefined();
    });

    it('should allow assigning methods', async () => {
      const stub = createMockRepositoryStub<IUserRepository>();
      stub.getUsers = async () => [{ id: '1', name: 'John' }];

      const users = await stub.getUsers();
      expect(users).toEqual([{ id: '1', name: 'John' }]);
    });

    it('should work with spies', async () => {
      const stub = createMockRepositoryStub<IUserRepository>();
      const getUsersSpy = vi.fn().mockResolvedValue([{ id: '1', name: 'Test' }]);
      stub.getUsers = getUsersSpy;

      await stub.getUsers();
      expect(getUsersSpy).toHaveBeenCalledTimes(1);
    });

    it('should allow overriding methods dynamically', async () => {
      const stub = createMockRepositoryStub<IUserRepository>();

      stub.getUserById = async (id) => ({ id, name: 'First' });
      expect((await stub.getUserById('1'))?.name).toBe('First');

      stub.getUserById = async (id) => ({ id, name: 'Second' });
      expect((await stub.getUserById('1'))?.name).toBe('Second');
    });

    it('should handle methods that return null', async () => {
      const stub = createMockRepositoryStub<IUserRepository>();
      stub.getUserById = async () => null;

      const result = await stub.getUserById('999');
      expect(result).toBeNull();
    });
  });

  describe('integration scenarios', () => {
    it('should work in a test scenario', async () => {
      const repo = createMockRepository<IUserRepository>({
        getUsers: async () => [
          { id: '1', name: 'Alice' },
          { id: '2', name: 'Bob' },
        ],
        getUserById: async (id) => {
          if (id === '1') return { id: '1', name: 'Alice' };
          if (id === '2') return { id: '2', name: 'Bob' };
          return null;
        },
        createUser: async (user) => ({ id: '3', name: user.name }),
      });

      const users = await repo.getUsers();
      expect(users).toHaveLength(2);

      const alice = await repo.getUserById('1');
      expect(alice?.name).toBe('Alice');

      const newUser = await repo.createUser({ name: 'Charlie' });
      expect(newUser.name).toBe('Charlie');
    });

    it('should work with partial mocks and spies', async () => {
      const repo = createMockRepository<IUserRepository>({
        getUsers: async () => [],
      });

      const deleteSpy = vi.fn().mockResolvedValue(undefined);
      repo.deleteUser = deleteSpy;

      await repo.deleteUser('1');
      expect(deleteSpy).toHaveBeenCalledWith('1');
    });
  });
});
