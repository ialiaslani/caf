import { describe, it, expect } from 'vitest';
import { ResourceBasedPermissionChecker } from '../src/adapters/ResourceBasedPermissionChecker';
import type { ResourcePermissionMap } from '../src/adapters/ResourceBasedPermissionChecker';

describe('ResourceBasedPermissionChecker', () => {
  const resourcePermissions: ResourcePermissionMap = {
    user: {
      create: ['admin'],
      read: ['admin', 'user', 'viewer'],
      update: ['admin', 'user'],
      delete: ['admin'],
    },
    post: {
      read: ['admin', 'editor', 'viewer'],
      create: ['admin', 'editor'],
      update: ['admin', 'editor'],
      delete: ['admin'],
    },
  };

  describe('check', () => {
    it('grants when user role has action on resource', () => {
      const checker = new ResourceBasedPermissionChecker(['admin', 'editor'], resourcePermissions);
      expect(checker.check('create:user')).toEqual({ granted: true, reason: undefined });
      expect(checker.check('read:post')).toEqual({ granted: true, reason: undefined });
    });

    it('denies when user role does not have action', () => {
      const checker = new ResourceBasedPermissionChecker(['viewer'], resourcePermissions);
      const result = checker.check('delete:post');
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('do not have permission');
    });

    it('denies for invalid format (missing colon)', () => {
      const checker = new ResourceBasedPermissionChecker(['admin'], resourcePermissions);
      const result = checker.check('invalid');
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('Invalid permission format');
      expect(result.reason).toContain('action:resource');
    });

    it('denies for unknown resource', () => {
      const checker = new ResourceBasedPermissionChecker(['admin'], resourcePermissions);
      const result = checker.check('read:unknown');
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('Resource').toContain('not found');
    });

    it('denies for undefined action on resource', () => {
      const checker = new ResourceBasedPermissionChecker(['admin'], resourcePermissions);
      const result = checker.check('publish:post');
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('Action').toContain('not defined');
    });

    it('trims action and resource', () => {
      const checker = new ResourceBasedPermissionChecker(['admin'], resourcePermissions);
      expect(checker.check(' read : user ').granted).toBe(true);
    });
  });

  describe('checkAny and checkAll', () => {
    it('checkAny grants when at least one is granted', () => {
      const checker = new ResourceBasedPermissionChecker(['viewer'], resourcePermissions);
      expect(checker.checkAny(['delete:user', 'read:user'])).toEqual({
        granted: true,
        reason: undefined,
      });
    });

    it('checkAll denies when any is missing', () => {
      const checker = new ResourceBasedPermissionChecker(['editor'], resourcePermissions);
      const result = checker.checkAll(['read:post', 'delete:post']);
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('delete:post');
    });
  });
});
