import { describe, it, expect } from 'vitest';
import { PermissionManager, PermissionDeniedError } from '../src/PermissionManager';
import { SimplePermissionChecker } from '../src/adapters/SimplePermissionChecker';

describe('PermissionManager', () => {
  const allowed = ['user.view', 'user.edit', 'post.create'];
  const checker = new SimplePermissionChecker(allowed);
  const manager = new PermissionManager(checker);

  describe('hasPermission', () => {
    it('returns true when permission is allowed', async () => {
      expect(await manager.hasPermission('user.view')).toBe(true);
      expect(await manager.hasPermission('user.edit')).toBe(true);
    });

    it('returns false when permission is not allowed', async () => {
      expect(await manager.hasPermission('user.delete')).toBe(false);
      expect(await manager.hasPermission('admin')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('returns true when at least one permission is allowed', async () => {
      expect(await manager.hasAnyPermission(['user.delete', 'user.view'])).toBe(true);
    });

    it('returns false when none are allowed', async () => {
      expect(await manager.hasAnyPermission(['user.delete', 'admin'])).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('returns true when all permissions are allowed', async () => {
      expect(await manager.hasAllPermissions(['user.view', 'user.edit'])).toBe(true);
    });

    it('returns false when any permission is missing', async () => {
      expect(await manager.hasAllPermissions(['user.view', 'user.delete'])).toBe(false);
    });
  });

  describe('requirePermission', () => {
    it('does not throw when permission is granted', async () => {
      await expect(manager.requirePermission('user.view')).resolves.toBeUndefined();
    });

    it('throws PermissionDeniedError when permission is denied', async () => {
      await expect(manager.requirePermission('user.delete')).rejects.toThrow(PermissionDeniedError);
      await expect(manager.requirePermission('user.delete')).rejects.toThrow(/Permission denied/);
    });
  });

  describe('requireAnyPermission', () => {
    it('does not throw when at least one permission is granted', async () => {
      await expect(manager.requireAnyPermission(['user.delete', 'user.view'])).resolves.toBeUndefined();
    });

    it('throws when all permissions are denied', async () => {
      await expect(manager.requireAnyPermission(['user.delete', 'admin'])).rejects.toThrow(PermissionDeniedError);
    });
  });

  describe('requireAllPermissions', () => {
    it('does not throw when all permissions are granted', async () => {
      await expect(manager.requireAllPermissions(['user.view', 'user.edit'])).resolves.toBeUndefined();
    });

    it('throws when any permission is denied', async () => {
      await expect(manager.requireAllPermissions(['user.view', 'user.delete'])).rejects.toThrow(PermissionDeniedError);
    });
  });

  describe('getChecker', () => {
    it('returns the underlying checker', () => {
      expect(manager.getChecker()).toBe(checker);
    });
  });

  describe('async checker', () => {
    it('handles Promise-returning checker', async () => {
      const asyncChecker = {
        check: async (p: string) =>
          ({ granted: p === 'async.ok', reason: p === 'async.ok' ? undefined : 'denied' }),
        checkAny: async (perms: string[]) =>
          ({ granted: perms.includes('async.ok'), reason: undefined }),
        checkAll: async (perms: string[]) =>
          ({ granted: perms.every((p) => p === 'async.ok'), reason: undefined }),
      };
      const asyncManager = new PermissionManager(asyncChecker);
      expect(await asyncManager.hasPermission('async.ok')).toBe(true);
      expect(await asyncManager.hasPermission('async.no')).toBe(false);
    });
  });
});

describe('PermissionDeniedError', () => {
  it('sets name to PermissionDeniedError', () => {
    const err = new PermissionDeniedError('test.perm');
    expect(err.name).toBe('PermissionDeniedError');
  });

  it('message includes permission when no reason', () => {
    const err = new PermissionDeniedError('user.delete');
    expect(err.message).toContain('user.delete');
    expect(err.message).toBe('Permission denied: user.delete');
  });

  it('message includes permission and reason when reason provided', () => {
    const err = new PermissionDeniedError('admin', 'Insufficient role');
    expect(err.message).toContain('admin');
    expect(err.message).toContain('Insufficient role');
    expect(err.reason).toBe('Insufficient role');
  });

  it('exposes permission and reason as readonly', () => {
    const err = new PermissionDeniedError('x', 'y');
    expect(err.permission).toBe('x');
    expect(err.reason).toBe('y');
  });
});
