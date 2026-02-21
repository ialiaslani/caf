import { describe, it, expect } from 'vitest';
import { RoleBasedPermissionChecker } from '../src/adapters/RoleBasedPermissionChecker';
import type { RolePermissionMap } from '../src/adapters/RoleBasedPermissionChecker';

describe('RoleBasedPermissionChecker', () => {
  const rolePermissions: RolePermissionMap = {
    admin: ['user.create', 'user.edit', 'user.delete', 'admin.dashboard'],
    editor: ['user.edit', 'post.create', 'post.edit'],
    viewer: ['user.view', 'post.view'],
  };

  describe('check', () => {
    it('grants permission when user has a role that includes it', () => {
      const checker = new RoleBasedPermissionChecker(['editor', 'viewer'], rolePermissions);
      expect(checker.check('user.edit')).toEqual({ granted: true, reason: undefined });
      expect(checker.check('post.view')).toEqual({ granted: true, reason: undefined });
    });

    it('denies permission when no role includes it', () => {
      const checker = new RoleBasedPermissionChecker(['viewer'], rolePermissions);
      const result = checker.check('user.delete');
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('user.delete');
      expect(result.reason).toContain('viewer');
    });

    it('handles empty user roles', () => {
      const checker = new RoleBasedPermissionChecker([], rolePermissions);
      expect(checker.check('user.view').granted).toBe(false);
    });

    it('handles unknown role (empty permissions for that role)', () => {
      const checker = new RoleBasedPermissionChecker(['unknown'], rolePermissions);
      expect(checker.check('any.permission').granted).toBe(false);
    });
  });

  describe('checkAny', () => {
    it('grants when at least one permission is in any role', () => {
      const checker = new RoleBasedPermissionChecker(['viewer'], rolePermissions);
      expect(checker.checkAny(['user.delete', 'post.view'])).toEqual({
        granted: true,
        reason: undefined,
      });
    });

    it('denies when none are granted', () => {
      const checker = new RoleBasedPermissionChecker(['viewer'], rolePermissions);
      const result = checker.checkAny(['user.delete', 'admin.dashboard']);
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('do not include any of the required permissions');
    });
  });

  describe('checkAll', () => {
    it('grants when all permissions are covered by roles', () => {
      const checker = new RoleBasedPermissionChecker(['admin'], rolePermissions);
      expect(checker.checkAll(['user.edit', 'user.delete'])).toEqual({
        granted: true,
        reason: undefined,
      });
    });

    it('denies when any permission is missing', () => {
      const checker = new RoleBasedPermissionChecker(['editor'], rolePermissions);
      const result = checker.checkAll(['user.edit', 'user.delete']);
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('missing permissions');
      expect(result.reason).toContain('user.delete');
    });
  });
});
