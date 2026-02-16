/**
 * Policy-based permission checker adapter for CAF Permission.
 * 
 * This adapter provides a flexible policy-based permission checking strategy
 * where permissions are granted based on custom policy functions.
 * 
 * @example
 * ```ts
 * import { PolicyBasedPermissionChecker } from '@c.a.f/permission/policy-based';
 * import { PermissionManager } from '@c.a.f/permission';
 * 
 * // Define policies
 * const policies = {
 *   'user.edit': (context: UserContext) => {
 *     return context.userId === context.targetUserId || context.roles.includes('admin');
 *   },
 *   'post.delete': (context: PostContext) => {
 *     return context.authorId === context.userId || context.roles.includes('admin');
 *   },
 * };
 * 
 * // Create checker with user context
 * const checker = new PolicyBasedPermissionChecker(policies, { userId: '123', roles: ['user'] });
 * const permissionManager = new PermissionManager(checker);
 * 
 * // Check permissions
 * const canEdit = await permissionManager.hasPermission('user.edit');
 * ```
 */

import type { IPermissionChecker, PermissionResult } from '../IPermissionChecker';

/**
 * Policy function that checks if a permission should be granted.
 * @param context User context or custom context object
 * @returns True if permission is granted, false otherwise
 */
export type PolicyFunction<T = unknown> = (context: T) => boolean | Promise<boolean>;

/**
 * Policy map that maps permission identifiers to policy functions.
 */
export interface PolicyMap<T = unknown> {
  [permission: string]: PolicyFunction<T>;
}

/**
 * Policy-based permission checker.
 * 
 * Checks permissions based on custom policy functions. Each permission
 * can have its own policy function that evaluates the user context.
 */
export class PolicyBasedPermissionChecker<T = unknown> implements IPermissionChecker {
  constructor(
    private policies: PolicyMap<T>,
    private context: T
  ) {}

  async check(permission: string): Promise<PermissionResult> {
    const policy = this.policies[permission];
    
    if (!policy) {
      return {
        granted: false,
        reason: `No policy defined for permission: ${permission}`,
      };
    }

    const granted = await policy(this.context);

    return {
      granted,
      reason: granted
        ? undefined
        : `Policy evaluation failed for permission: ${permission}`,
    };
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
        : `None of the permissions passed policy evaluation: ${permissions.join(', ')}`,
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
        : `Some permissions failed policy evaluation: ${deniedPermissions.join(', ')}`,
    };
  }
}
