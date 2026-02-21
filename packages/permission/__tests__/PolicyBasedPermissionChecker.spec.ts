import { describe, it, expect } from 'vitest';
import { PolicyBasedPermissionChecker } from '../src/adapters/PolicyBasedPermissionChecker';

type Ctx = { userId: string; role: string };

describe('PolicyBasedPermissionChecker', () => {
  const policies = {
    'user.edit': (ctx: Ctx) => ctx.role === 'admin' || ctx.userId === 'owner',
    'post.delete': (ctx: Ctx) => ctx.role === 'admin',
    'always.true': () => true,
    'always.false': () => false,
    'async.true': async () => true,
    'async.false': async () => false,
  };
  const context: Ctx = { userId: 'user1', role: 'editor' };

  describe('check', () => {
    it('grants when policy returns true', async () => {
      const checker = new PolicyBasedPermissionChecker<Ctx>(policies, context);
      expect(await checker.check('always.true')).toEqual({ granted: true, reason: undefined });
    });

    it('denies when policy returns false', async () => {
      const checker = new PolicyBasedPermissionChecker<Ctx>(policies, context);
      const result = await checker.check('always.false');
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('Policy evaluation failed');
    });

    it('denies when no policy is defined for permission', async () => {
      const checker = new PolicyBasedPermissionChecker<Ctx>(policies, context);
      const result = await checker.check('unknown.permission');
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('No policy defined');
    });

    it('evaluates context (granted for admin)', async () => {
      const adminChecker = new PolicyBasedPermissionChecker<Ctx>(policies, {
        userId: 'a',
        role: 'admin',
      });
      expect(await adminChecker.check('post.delete')).toEqual({
        granted: true,
        reason: undefined,
      });
    });

    it('evaluates context (denied for editor)', async () => {
      const checker = new PolicyBasedPermissionChecker<Ctx>(policies, context);
      const result = await checker.check('post.delete');
      expect(result.granted).toBe(false);
    });

    it('handles async policy', async () => {
      const checker = new PolicyBasedPermissionChecker<Ctx>(policies, context);
      expect(await checker.check('async.true')).toEqual({ granted: true, reason: undefined });
      expect(await checker.check('async.false').then((r) => r.granted)).toBe(false);
    });
  });

  describe('checkAny', () => {
    it('grants when at least one permission passes', async () => {
      const checker = new PolicyBasedPermissionChecker<Ctx>(policies, context);
      expect(await checker.checkAny(['always.false', 'always.true'])).toEqual({
        granted: true,
        reason: undefined,
      });
    });

    it('denies when all fail', async () => {
      const checker = new PolicyBasedPermissionChecker<Ctx>(policies, context);
      const result = await checker.checkAny(['always.false', 'post.delete']);
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('None of the permissions passed policy');
    });
  });

  describe('checkAll', () => {
    it('grants when all pass', async () => {
      const checker = new PolicyBasedPermissionChecker<Ctx>(policies, {
        userId: 'owner',
        role: 'editor',
      });
      expect(await checker.checkAll(['user.edit', 'always.true'])).toEqual({
        granted: true,
        reason: undefined,
      });
    });

    it('denies and lists failed permissions when some fail', async () => {
      const checker = new PolicyBasedPermissionChecker<Ctx>(policies, context);
      const result = await checker.checkAll(['always.true', 'post.delete']);
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('post.delete');
    });
  });
});
