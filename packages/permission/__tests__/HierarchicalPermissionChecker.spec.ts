import { describe, it, expect } from 'vitest';
import { HierarchicalPermissionChecker } from '../src/adapters/HierarchicalPermissionChecker';

describe('HierarchicalPermissionChecker', () => {
  const allowed = ['admin.*', 'user.edit.*', 'post.create', 'read'];
  const checker = new HierarchicalPermissionChecker(allowed);

  describe('check', () => {
    it('grants exact match', () => {
      expect(checker.check('post.create')).toEqual({ granted: true, reason: undefined });
      expect(checker.check('read')).toEqual({ granted: true, reason: undefined });
    });

    it('grants when permission is under a wildcard prefix', () => {
      expect(checker.check('admin.dashboard')).toEqual({ granted: true, reason: undefined });
      expect(checker.check('admin.users.list')).toEqual({ granted: true, reason: undefined });
      expect(checker.check('user.edit.name')).toEqual({ granted: true, reason: undefined });
    });

    it('denies when permission is not exact and not under any wildcard', () => {
      const result = checker.check('post.delete');
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('post.delete');
      expect(result.reason).toContain('hierarchical');
    });

    it('denies when prefix matches but no dot after prefix (admin does not match admin)', () => {
      // Implementation: permission.startsWith(prefix + '.') so 'admin' has prefix 'admin', we need 'admin.'...
      const result = checker.check('admin');
      expect(result.granted).toBe(false);
    });
  });

  describe('checkAny', () => {
    it('grants when at least one is granted', () => {
      expect(checker.checkAny(['post.delete', 'read'])).toEqual({
        granted: true,
        reason: undefined,
      });
    });

    it('denies when none are granted', () => {
      const result = checker.checkAny(['post.delete', 'user.view']);
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('None of the permissions');
    });
  });

  describe('checkAll', () => {
    it('grants when all are granted', () => {
      expect(checker.checkAll(['admin.dashboard', 'post.create'])).toEqual({
        granted: true,
        reason: undefined,
      });
    });

    it('denies when any is missing', () => {
      const result = checker.checkAll(['admin.dashboard', 'post.delete']);
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('Missing permissions');
      expect(result.reason).toContain('post.delete');
    });
  });
});
