/**
 * Time-based permission checker adapter for CAF Permission.
 * 
 * This adapter provides time-based permission checking where permissions
 * can be granted or revoked based on time constraints.
 * 
 * @example
 * ```ts
 * import { TimeBasedPermissionChecker } from '@c-a-f/permission/time-based';
 * import { PermissionManager } from '@c-a-f/permission';
 * 
 * // Define time-based permissions
 * const timePermissions = {
 *   'user.edit': {
 *     allowed: true,
 *     startTime: new Date('2024-01-01'),
 *     endTime: new Date('2024-12-31'),
 *     allowedDays: [1, 2, 3, 4, 5], // Monday to Friday
 *     allowedHours: { start: 9, end: 17 }, // 9 AM to 5 PM
 *   },
 *   'admin.dashboard': {
 *     allowed: true,
 *     // No time restrictions
 *   },
 * };
 * 
 * // Create checker with base checker
 * const baseChecker = new SimplePermissionChecker(['user.edit', 'admin.dashboard']);
 * const checker = new TimeBasedPermissionChecker(baseChecker, timePermissions);
 * const permissionManager = new PermissionManager(checker);
 * 
 * // Check permissions (will check time constraints)
 * const canEdit = await permissionManager.hasPermission('user.edit');
 * ```
 */

import type { IPermissionChecker, PermissionResult } from '../IPermissionChecker';

/**
 * Time constraint configuration for a permission.
 */
export interface TimeConstraint {
  /** Whether the permission is allowed */
  allowed: boolean;
  /** Optional start time */
  startTime?: Date;
  /** Optional end time */
  endTime?: Date;
  /** Optional allowed days of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday) */
  allowedDays?: number[];
  /** Optional allowed hours range */
  allowedHours?: {
    start: number; // 0-23
    end: number; // 0-23
  };
}

/**
 * Time-based permission map.
 * Maps permission identifiers to time constraints.
 */
export interface TimePermissionMap {
  [permission: string]: TimeConstraint;
}

/**
 * Time-based permission checker wrapper.
 * 
 * Wraps another permission checker and adds time-based constraints.
 * If a permission has time constraints, they are checked in addition to the base checker.
 */
export class TimeBasedPermissionChecker implements IPermissionChecker {
  constructor(
    private baseChecker: IPermissionChecker,
    private timePermissions: TimePermissionMap = {}
  ) {}

  /**
   * Check if current time is within allowed time constraints.
   */
  private isTimeAllowed(constraint: TimeConstraint): boolean {
    const now = new Date();

    // Check date range
    if (constraint.startTime && now < constraint.startTime) {
      return false;
    }
    if (constraint.endTime && now > constraint.endTime) {
      return false;
    }

    // Check day of week
    if (constraint.allowedDays && constraint.allowedDays.length > 0) {
      const dayOfWeek = now.getDay();
      if (!constraint.allowedDays.includes(dayOfWeek)) {
        return false;
      }
    }

    // Check hour range
    if (constraint.allowedHours) {
      const hour = now.getHours();
      const { start, end } = constraint.allowedHours;
      if (start <= end) {
        // Normal range (e.g., 9 AM to 5 PM)
        if (hour < start || hour >= end) {
          return false;
        }
      } else {
        // Wrapping range (e.g., 10 PM to 2 AM)
        if (hour < start && hour >= end) {
          return false;
        }
      }
    }

    return true;
  }

  async check(permission: string): Promise<PermissionResult> {
    // First check base permission
    const raw = await this.baseChecker.check(permission);
    const baseResult: PermissionResult = {
      granted: Boolean(raw?.granted),
      reason: raw?.reason,
    };

    if (!baseResult.granted) {
      return baseResult;
    }

    // Check time constraints if defined
    const timeConstraint = this.timePermissions[permission];
    if (timeConstraint) {
      if (!timeConstraint.allowed) {
        return {
          granted: false,
          reason: `Permission '${permission}' is not allowed by time constraint configuration`,
        };
      }

      if (!this.isTimeAllowed(timeConstraint)) {
        return {
          granted: false,
          reason: `Permission '${permission}' is not allowed at the current time`,
        };
      }
    }

    return baseResult;
  }

  async checkAny(permissions: string[]): Promise<PermissionResult> {
    const results = await Promise.all(
      permissions.map(permission => this.check(permission))
    );

    const granted = results.some(result => result.granted);

    return {
      granted,
      reason: granted
        ? undefined
        : `None of the permissions are granted (including time constraints): ${permissions.join(', ')}`,
    };
  }

  async checkAll(permissions: string[]): Promise<PermissionResult> {
    const results = await Promise.all(
      permissions.map(permission => this.check(permission))
    );

    const allGranted = results.every(result => result.granted);
    const deniedPermissions = permissions.filter(
      (_, index) => !results[index].granted
    );

    return {
      granted: allGranted,
      reason: allGranted
        ? undefined
        : `Some permissions failed (including time constraints): ${deniedPermissions.join(', ')}`,
    };
  }
}
