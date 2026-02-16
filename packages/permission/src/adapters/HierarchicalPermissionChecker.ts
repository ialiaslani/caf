/**
 * Hierarchical permission checker adapter for CAF Permission.
 * 
 * This adapter provides hierarchical permission checking where permissions
 * can inherit from parent permissions (e.g., 'admin.*' grants all admin permissions).
 * 
 * @example
 * ```ts
 * import { HierarchicalPermissionChecker } from '@c.a.f/permission/hierarchical';
 * import { PermissionManager } from '@c.a.f/permission';
 * 
 * // Define hierarchical permissions
 * const userPermissions = [
 *   'admin.*',           // Grants all admin permissions
 *   'user.edit.*',       // Grants all user.edit permissions
 *   'post.create',       // Specific permission
 * ];
 * 
 * // Create checker
 * const checker = new HierarchicalPermissionChecker(userPermissions);
 * const permissionManager = new PermissionManager(checker);
 * 
 * // Check permissions
 * const canAdmin = await permissionManager.hasPermission('admin.dashboard'); // true (inherited from admin.*)
 * const canEditUser = await permissionManager.hasPermission('user.edit.name'); // true (inherited from user.edit.*)
 * const canCreatePost = await permissionManager.hasPermission('post.create'); // true (exact match)
 * const canDeletePost = await permissionManager.hasPermission('post.delete'); // false
 * ```
 */

import type { IPermissionChecker, PermissionResult } from '../IPermissionChecker';

/**
 * Hierarchical permission checker.
 * 
 * Checks permissions with support for wildcard inheritance.
 * Permissions ending with '.*' grant all child permissions.
 * For example, 'admin.*' grants 'admin.dashboard', 'admin.users', etc.
 */
export class HierarchicalPermissionChecker implements IPermissionChecker {
  constructor(private allowedPermissions: string[]) {}

  /**
   * Check if a permission is granted, considering hierarchical inheritance.
   */
  private isPermissionGranted(permission: string): boolean {
    // Exact match
    if (this.allowedPermissions.includes(permission)) {
      return true;
    }

    // Check for wildcard matches (e.g., 'admin.*' matches 'admin.dashboard')
    const wildcardMatches = this.allowedPermissions.filter(perm => perm.endsWith('.*'));
    
    for (const wildcardPerm of wildcardMatches) {
      const prefix = wildcardPerm.slice(0, -2); // Remove '.*'
      if (permission.startsWith(prefix + '.')) {
        return true;
      }
    }

    return false;
  }

  check(permission: string): PermissionResult {
    const granted = this.isPermissionGranted(permission);

    return {
      granted,
      reason: granted
        ? undefined
        : `Permission '${permission}' is not granted (checked exact match and hierarchical inheritance)`,
    };
  }

  checkAny(permissions: string[]): PermissionResult {
    const grantedPermissions = permissions.filter(permission =>
      this.isPermissionGranted(permission)
    );

    return {
      granted: grantedPermissions.length > 0,
      reason:
        grantedPermissions.length === 0
          ? `None of the permissions are granted: ${permissions.join(', ')}`
          : undefined,
    };
  }

  checkAll(permissions: string[]): PermissionResult {
    const missingPermissions = permissions.filter(
      permission => !this.isPermissionGranted(permission)
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
