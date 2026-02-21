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
});
