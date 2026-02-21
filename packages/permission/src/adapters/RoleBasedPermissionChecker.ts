/**
 * Role-based permission checker adapter for CAF Permission.
 * 
 * This adapter provides a simple role-based permission checking strategy
 * where permissions are granted based on user roles.
 * 
 * @example
 * ```ts
 * import { RoleBasedPermissionChecker } from '@c-a-f/permission/role-based';
 * import { PermissionManager } from '@c-a-f/permission';
 * 
 * // Define role-to-permission mapping
 * const rolePermissions = {
 *   admin: ['user.create', 'user.edit', 'user.delete', 'admin.dashboard'],
 *   editor: ['user.edit', 'post.create', 'post.edit'],
 *   viewer: ['user.view', 'post.view'],
 * };
 * 
 * // Create checker with user roles
 * const checker = new RoleBasedPermissionChecker(['admin', 'editor'], rolePermissions);
 * const permissionManager = new PermissionManager(checker);
 * 
 * // Check permissions
 * const canEdit = await permissionManager.hasPermission('user.edit');
 * await permissionManager.requirePermission('user.delete');
 * ```
 */

import type { IPermissionChecker, PermissionResult } from '../IPermissionChecker';

/**
 * Role-to-permission mapping.
 * Maps role names to arrays of permission identifiers.
 */
export interface RolePermissionMap {
  [role: string]: string[];
}

/**
 * Role-based permission checker.
 * 
 * Checks permissions based on user roles. A permission is granted if
 * the user has at least one role that includes that permission.
 */
export class RoleBasedPermissionChecker implements IPermissionChecker {
  constructor(
    private userRoles: string[],
    private rolePermissions: RolePermissionMap = {}
  ) {}

  check(permission: string): PermissionResult {
    const hasPermission = this.userRoles.some(role => {
      const permissions = this.rolePermissions[role] || [];
      return permissions.includes(permission);
    });

    return {
      granted: hasPermission,
      reason: hasPermission
        ? undefined
        : `User roles (${this.userRoles.join(', ')}) do not include permission: ${permission}`,
    };
  }

  checkAny(permissions: string[]): PermissionResult {
    const grantedPermissions = permissions.filter(permission => {
      return this.userRoles.some(role => {
        const rolePerms = this.rolePermissions[role] || [];
        return rolePerms.includes(permission);
      });
    });

    return {
      granted: grantedPermissions.length > 0,
      reason:
        grantedPermissions.length === 0
          ? `User roles (${this.userRoles.join(', ')}) do not include any of the required permissions: ${permissions.join(', ')}`
          : undefined,
    };
  }

  checkAll(permissions: string[]): PermissionResult {
    const missingPermissions = permissions.filter(permission => {
      return !this.userRoles.some(role => {
        const rolePerms = this.rolePermissions[role] || [];
        return rolePerms.includes(permission);
      });
    });

    return {
      granted: missingPermissions.length === 0,
      reason:
        missingPermissions.length > 0
          ? `User roles (${this.userRoles.join(', ')}) are missing permissions: ${missingPermissions.join(', ')}`
          : undefined,
    };
  }
}
