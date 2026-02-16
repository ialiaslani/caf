/**
 * CASL adapter for CAF Permission.
 * 
 * This adapter provides integration with CASL (Isomorphic Authorization Library).
 * CASL allows you to define abilities and check permissions based on actions and subjects.
 * 
 * @example
 * ```ts
 * import { AbilityBuilder, Ability } from '@casl/ability';
 * import { CaslPermissionChecker } from '@c.a.f/permission/casl';
 * import { PermissionManager } from '@c.a.f/permission';
 * 
 * // Define abilities using CASL
 * const { can, cannot, build } = new AbilityBuilder(Ability);
 * can('read', 'Post');
 * can('delete', 'Post', { authorId: '123' });
 * 
 * const ability = build();
 * 
 * // Create checker
 * const checker = new CaslPermissionChecker(ability);
 * const permissionManager = new PermissionManager(checker);
 * 
 * // Check permissions (CASL uses 'action:subject' format)
 * const canRead = await permissionManager.hasPermission('read:Post');
 * const canDelete = await permissionManager.hasPermission('delete:Post');
 * ```
 */

import type { IPermissionChecker, PermissionResult } from '../IPermissionChecker';

/**
 * CASL permission checker adapter.
 * 
 * Checks permissions using CASL abilities. Permissions should be in the format
 * 'action:subject' (e.g., 'read:Post', 'delete:User').
 */
export class CaslPermissionChecker implements IPermissionChecker {
  constructor(
    private ability: {
      can: (action: string, subject: string, field?: string) => boolean;
      cannot: (action: string, subject: string, field?: string) => boolean;
    }
  ) {}

  check(permission: string): PermissionResult {
    const [action, subject] = permission.split(':');
    
    if (!action || !subject) {
      return {
        granted: false,
        reason: `Invalid permission format. Expected 'action:subject', got: ${permission}`,
      };
    }

    const granted = this.ability.can(action.trim(), subject.trim());

    return {
      granted,
      reason: granted
        ? undefined
        : `CASL ability check failed for: ${permission}`,
    };
  }

  checkAny(permissions: string[]): PermissionResult {
    const grantedPermissions = permissions.filter(permission => {
      const [action, subject] = permission.split(':');
      if (!action || !subject) return false;
      return this.ability.can(action.trim(), subject.trim());
    });

    return {
      granted: grantedPermissions.length > 0,
      reason:
        grantedPermissions.length === 0
          ? `None of the permissions passed CASL ability check: ${permissions.join(', ')}`
          : undefined,
    };
  }

  checkAll(permissions: string[]): PermissionResult {
    const missingPermissions = permissions.filter(permission => {
      const [action, subject] = permission.split(':');
      if (!action || !subject) return true;
      return !this.ability.can(action.trim(), subject.trim());
    });

    return {
      granted: missingPermissions.length === 0,
      reason:
        missingPermissions.length > 0
          ? `Some permissions failed CASL ability check: ${missingPermissions.join(', ')}`
          : undefined,
    };
  }
}
