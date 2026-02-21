import { describe, it, expect } from 'vitest';
import { TimeBasedPermissionChecker } from '../src/adapters/TimeBasedPermissionChecker';
import { SimplePermissionChecker } from '../src/adapters/SimplePermissionChecker';

describe('TimeBasedPermissionChecker', () => {
  const baseAllowed = ['user.edit', 'admin.dashboard'];
  const baseChecker = new SimplePermissionChecker(baseAllowed);

  describe('check', () => {
    it('returns base result when no time constraint for permission', async () => {
      const checker = new TimeBasedPermissionChecker(baseChecker, {});
      expect(await checker.check('user.edit')).toEqual({ granted: true, reason: undefined });
      const unknownResult = await checker.check('unknown');
      expect(unknownResult.granted).toBe(false);
    });

    it('denies when time constraint has allowed: false', async () => {
      const checker = new TimeBasedPermissionChecker(baseChecker, {
        'user.edit': { allowed: false },
      });
      const result = await checker.check('user.edit');
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('not allowed by time constraint');
    });

    it('denies when base checker denies (no time constraint)', async () => {
      const checker = new TimeBasedPermissionChecker(baseChecker, {});
      const result = await checker.check('other.perm');
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('not in the allowed permissions list');
    });

    it('grants when constraint allowed and time allowed (wide range)', async () => {
      const past = new Date(2000, 0, 1);
      const future = new Date(2030, 11, 31);
      const checker = new TimeBasedPermissionChecker(baseChecker, {
        'user.edit': {
          allowed: true,
          startTime: past,
          endTime: future,
          allowedDays: [0, 1, 2, 3, 4, 5, 6],
          allowedHours: { start: 0, end: 24 },
        },
      });
      expect(await checker.check('user.edit')).toEqual({ granted: true, reason: undefined });
    });

    it('denies when current time is before startTime', async () => {
      const futureStart = new Date(Date.now() + 86400000 * 365);
      const checker = new TimeBasedPermissionChecker(baseChecker, {
        'user.edit': { allowed: true, startTime: futureStart },
      });
      const result = await checker.check('user.edit');
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('not allowed at the current time');
    });

    it('denies when current time is after endTime', async () => {
      const pastEnd = new Date(2000, 0, 1);
      const checker = new TimeBasedPermissionChecker(baseChecker, {
        'user.edit': { allowed: true, endTime: pastEnd },
      });
      const result = await checker.check('user.edit');
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('not allowed at the current time');
    });
  });

  describe('checkAny and checkAll', () => {
    it('checkAny grants when at least one passes', async () => {
      const checker = new TimeBasedPermissionChecker(baseChecker, {
        'user.edit': { allowed: false },
      });
      expect(await checker.checkAny(['user.edit', 'admin.dashboard'])).toEqual({
        granted: true,
        reason: undefined,
      });
    });

    it('checkAll denies when any fails', async () => {
      const checker = new TimeBasedPermissionChecker(baseChecker, {
        'user.edit': { allowed: false },
      });
      const result = await checker.checkAll(['user.edit', 'admin.dashboard']);
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('user.edit');
    });
  });
});
