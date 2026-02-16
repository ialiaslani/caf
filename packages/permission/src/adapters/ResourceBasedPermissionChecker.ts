/**
 * Resource-based permission checker adapter for CAF Permission.
 * 
 * This adapter provides resource-based access control (RBAC with resources).
 * Permissions are checked based on resource type and action.
 * 
 * @example
 * ```ts
 * import { ResourceBasedPermissionChecker } from '@caf/permission/resource-based';
 * import { PermissionManager } from '@caf/permission';
 * 
 * // Define resource permissions
 * const resourcePermissions = {
 *   user: {
 *     create: ['admin'],
 *     read: ['admin', 'user', 'viewer'],
 *     update: ['admin', 'user'],
 *     delete: ['admin'],
 *   },
 *   post: {
 *     create: ['admin', 'editor'],
 *     read: ['admin', 'editor', 'viewer'],
 *     update: ['admin', 'editor'],
 *     delete: ['admin'],
 *   },
 * };
 * 
 * // Create checker with user roles
 * const checker = new ResourceBasedPermissionChecker(['admin', 'editor'], resourcePermissions);
 * const permissionManager = new PermissionManager(checker);
 * 
 * // Check permissions (format: 'action:resource')
 * const canCreate = await permissionManager.hasPermission('create:user');
 * const canRead = await permissionManager.hasPermission('read:post');
 * ```
 */

import type { IPermissionChecker, PermissionResult } from '../IPermissionChecker';

/**
 * Resource permission map.
 * Maps resource types to actions and allowed roles.
 */
export interface ResourcePermissionMap {
  [resource: string]: {
    [action: string]: string[];
  };
}

/**
 * Resource-based permission checker.
 * 
 * Checks permissions based on resource type and action.
 * Permissions should be in the format 'action:resource' (e.g., 'create:user', 'read:post').
 */
export class ResourceBasedPermissionChecker implements IPermissionChecker {
  constructor(
    private userRoles: string[],
    private resourcePermissions: ResourcePermissionMap = {}
  ) {}

  check(permission: string): PermissionResult {
    const [action, resource] = permission.split(':');
    
    if (!action || !resource) {
      return {
        granted: false,
        reason: `Invalid permission format. Expected 'action:resource', got: ${permission}`,
      };
    }

    const resourcePerms = this.resourcePermissions[resource.trim()];
    if (!resourcePerms) {
      return {
        granted: false,
        reason: `Resource '${resource}' not found in permissions map`,
      };
    }

    const allowedRoles = resourcePerms[action.trim()];
    if (!allowedRoles) {
      return {
        granted: false,
        reason: `Action '${action}' not defined for resource '${resource}'`,
      };
    }

    const hasPermission = this.userRoles.some(role => allowedRoles.includes(role));

    return {
      granted: hasPermission,
      reason: hasPermission
        ? undefined
        : `User roles (${this.userRoles.join(', ')}) do not have permission '${action}' on resource '${resource}'`,
    };
  }

  checkAny(permissions: string[]): PermissionResult {
    const grantedPermissions = permissions.filter(permission => {
      const result = this.check(permission);
      return result.granted;
    });

    return {
      granted: grantedPermissions.length > 0,
      reason:
        grantedPermissions.length === 0
          ? `None of the permissions are granted: ${permissions.join(', ')}`
          : undefined,
    };
  }

  checkAll(permissions: string[]): PermissionResult {
    const missingPermissions = permissions.filter(permission => {
      const result = this.check(permission);
      return !result.granted;
    });

    return {
      granted: missingPermissions.length === 0,
      reason:
        missingPermissions.length > 0
          ? `Missing permissions: ${missingPermissions.join(', ')}`
          : undefined,
    };
  }
}
