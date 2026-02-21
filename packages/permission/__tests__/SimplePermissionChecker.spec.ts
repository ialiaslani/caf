import { describe, it, expect } from 'vitest';
import { SimplePermissionChecker } from '../src/adapters/SimplePermissionChecker';

describe('SimplePermissionChecker', () => {
  const allowed = ['read', 'write', 'admin'];
  const checker = new SimplePermissionChecker(allowed);

  describe('check', () => {
    it('returns granted: true when permission is in the list', () => {
      expect(checker.check('read')).toEqual({ granted: true, reason: undefined });
      expect(checker.check('admin')).toEqual({ granted: true, reason: undefined });
    });

    it('returns granted: false with reason when permission is not in the list', () => {
      const result = checker.check('delete');
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('delete');
      expect(result.reason).toContain('not in the allowed permissions list');
    });
  });

  describe('checkAny', () => {
    it('returns granted: true when at least one permission is allowed', () => {
      expect(checker.checkAny(['delete', 'read'])).toEqual({ granted: true, reason: undefined });
    });

    it('returns granted: false when none are allowed', () => {
      const result = checker.checkAny(['delete', 'other']);
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('None of the permissions');
    });
  });

  describe('checkAll', () => {
    it('returns granted: true when all permissions are allowed', () => {
      expect(checker.checkAll(['read', 'write'])).toEqual({ granted: true, reason: undefined });
    });

    it('returns granted: false when any permission is missing', () => {
      const result = checker.checkAll(['read', 'delete']);
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('Missing permissions');
      expect(result.reason).toContain('delete');
    });
  });
});
