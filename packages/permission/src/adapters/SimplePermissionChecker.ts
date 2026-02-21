/**
 * Simple permission checker adapter for CAF Permission.
 * 
 * This adapter provides a simple permission checking strategy where
 * permissions are granted based on a direct list of allowed permissions.
 * 
 * @example
 * ```ts
 * import { SimplePermissionChecker } from '@c-a-f/permission/simple';
 * import { PermissionManager } from '@c-a-f/permission';
 * 
 * // Create checker with user permissions
 * const checker = new SimplePermissionChecker([
 *   'user.view',
 *   'user.edit',
 *   'post.create',
 * ]);
 * const permissionManager = new PermissionManager(checker);
 * 
 * // Check permissions
 * const canEdit = await permissionManager.hasPermission('user.edit');
 * await permissionManager.requirePermission('user.delete'); // Throws error
 * ```
 */

import type { IPermissionChecker, PermissionResult } from '../IPermissionChecker';

/**
 * Simple permission checker.
 * 
 * Checks permissions based on a direct list of allowed permissions.
 * A permission is granted if it exists in the allowed permissions list.
 */
export class SimplePermissionChecker implements IPermissionChecker {
  constructor(private allowedPermissions: string[]) {}

  check(permission: string): PermissionResult {
    const granted = this.allowedPermissions.includes(permission);

    return {
      granted,
      reason: granted
        ? undefined
        : `Permission '${permission}' is not in the allowed permissions list`,
    };
  }

  checkAny(permissions: string[]): PermissionResult {
    const grantedPermissions = permissions.filter(permission =>
      this.allowedPermissions.includes(permission)
    );

    return {
      granted: grantedPermissions.length > 0,
      reason:
        grantedPermissions.length === 0
          ? `None of the permissions are in the allowed permissions list: ${permissions.join(', ')}`
          : undefined,
    };
  }

  checkAll(permissions: string[]): PermissionResult {
    const missingPermissions = permissions.filter(
      permission => !this.allowedPermissions.includes(permission)
    );

    return {
      granted: missingPermissions.length === 0,
      reason:
        missingPermissions.length > 0
          ? `Missing permissions: ${missingPermissions.join(', ')}`
          : undefined,
    };
  }
}
