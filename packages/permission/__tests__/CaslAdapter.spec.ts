import { describe, it, expect } from 'vitest';
import { CaslPermissionChecker } from '../src/adapters/CaslAdapter';

describe('CaslPermissionChecker', () => {
  const createMockAbility = (canResults: Record<string, boolean>) => ({
    can: (action: string, subject: string) => {
      const key = `${action}:${subject}`;
      return canResults[key] ?? false;
    },
    cannot: () => false,
  });

  describe('check', () => {
    it('grants when ability.can returns true', () => {
      const ability = createMockAbility({ 'read:Post': true });
      const checker = new CaslPermissionChecker(ability);
      expect(checker.check('read:Post')).toEqual({ granted: true, reason: undefined });
    });

    it('denies when ability.can returns false', () => {
      const ability = createMockAbility({});
      const checker = new CaslPermissionChecker(ability);
      const result = checker.check('delete:Post');
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('CASL ability check failed');
    });

    it('denies for invalid format (no colon)', () => {
      const ability = createMockAbility({});
      const checker = new CaslPermissionChecker(ability);
      const result = checker.check('invalid');
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('Invalid permission format');
      expect(result.reason).toContain('action:subject');
    });

    it('trims action and subject', () => {
      const ability = createMockAbility({ 'read:Post': true });
      const checker = new CaslPermissionChecker(ability);
      expect(checker.check(' read : Post ')).toEqual({ granted: true, reason: undefined });
    });
  });

  describe('checkAny', () => {
    it('grants when at least one permission passes', () => {
      const ability = createMockAbility({ 'read:Post': true });
      const checker = new CaslPermissionChecker(ability);
      expect(checker.checkAny(['delete:Post', 'read:Post'])).toEqual({
        granted: true,
        reason: undefined,
      });
    });

    it('denies when all fail', () => {
      const ability = createMockAbility({});
      const checker = new CaslPermissionChecker(ability);
      const result = checker.checkAny(['read:Post', 'delete:Post']);
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('None of the permissions passed CASL');
    });

    it('skips invalid format entries (treats as false)', () => {
      const ability = createMockAbility({ 'read:Post': true });
      const checker = new CaslPermissionChecker(ability);
      const result = checker.checkAny(['badformat', 'read:Post']);
      expect(result.granted).toBe(true);
    });
  });

  describe('checkAll', () => {
    it('grants when all pass', () => {
      const ability = createMockAbility({ 'read:Post': true, 'delete:Post': true });
      const checker = new CaslPermissionChecker(ability);
      expect(checker.checkAll(['read:Post', 'delete:Post'])).toEqual({
        granted: true,
        reason: undefined,
      });
    });

    it('denies and lists failed when some fail', () => {
      const ability = createMockAbility({ 'read:Post': true });
      const checker = new CaslPermissionChecker(ability);
      const result = checker.checkAll(['read:Post', 'delete:Post']);
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('delete:Post');
    });
  });
});
