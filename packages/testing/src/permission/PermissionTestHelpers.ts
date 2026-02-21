/**
 * Test helpers for Permission.
 * 
 * Provides utilities for testing permission checkers and managers.
 * 
 * @example
 * ```ts
 * import { createMockPermissionChecker, createPermissionTester } from '@c-a-f/testing/permission';
 * import { PermissionManager } from '@c-a-f/permission';
 * 
 * const mockChecker = createMockPermissionChecker(['user.edit', 'post.create']);
 * const manager = new PermissionManager(mockChecker);
 * const tester = createPermissionTester(manager);
 * 
 * expect(await tester.hasPermission('user.edit')).toBe(true);
 * ```
 */

import type { IPermissionChecker, PermissionResult, PermissionManager } from '@c-a-f/permission';

/**
 * Mock PermissionChecker implementation for testing.
 */
export class MockPermissionChecker implements IPermissionChecker {
  constructor(private allowedPermissions: string[] = []) {}

  check(permission: string): PermissionResult {
    const granted = this.allowedPermissions.includes(permission);
    return {
      granted,
      reason: granted ? undefined : `Permission '${permission}' not granted`,
    };
  }

  checkAny(permissions: string[]): PermissionResult {
    const granted = permissions.some(p => this.allowedPermissions.includes(p));
    return {
      granted,
      reason: granted ? undefined : 'None of the permissions are granted',
    };
  }

  checkAll(permissions: string[]): PermissionResult {
    const missing = permissions.filter(p => !this.allowedPermissions.includes(p));
    return {
      granted: missing.length === 0,
      reason: missing.length > 0 ? `Missing permissions: ${missing.join(', ')}` : undefined,
    };
  }

  /**
   * Add a permission (for testing).
   */
  addPermission(permission: string): void {
    if (!this.allowedPermissions.includes(permission)) {
      this.allowedPermissions.push(permission);
    }
  }

  /**
   * Remove a permission (for testing).
   */
  removePermission(permission: string): void {
    const index = this.allowedPermissions.indexOf(permission);
    if (index > -1) {
      this.allowedPermissions.splice(index, 1);
    }
  }
}

/**
 * Create a mock PermissionChecker.
 */
export function createMockPermissionChecker(allowedPermissions: string[] = []): MockPermissionChecker {
  return new MockPermissionChecker(allowedPermissions);
}

/**
 * Permission tester utility.
 */
export class PermissionTester {
  constructor(public readonly manager: PermissionManager) {}

  /**
   * Check if permission is granted.
   */
  async hasPermission(permission: string): Promise<boolean> {
    return await this.manager.hasPermission(permission);
  }

  /**
   * Check if any permission is granted.
   */
  async hasAnyPermission(permissions: string[]): Promise<boolean> {
    return await this.manager.hasAnyPermission(permissions);
  }

  /**
   * Check if all permissions are granted.
   */
  async hasAllPermissions(permissions: string[]): Promise<boolean> {
    return await this.manager.hasAllPermissions(permissions);
  }

  /**
   * Require permission (throws if denied).
   */
  async requirePermission(permission: string): Promise<void> {
    await this.manager.requirePermission(permission);
  }

  /**
   * Require any permission (throws if all denied).
   */
  async requireAnyPermission(permissions: string[]): Promise<void> {
    await this.manager.requireAnyPermission(permissions);
  }

  /**
   * Require all permissions (throws if any denied).
   */
  async requireAllPermissions(permissions: string[]): Promise<void> {
    await this.manager.requireAllPermissions(permissions);
  }
}

/**
 * Create a Permission tester instance.
 */
export function createPermissionTester(manager: PermissionManager): PermissionTester {
  return new PermissionTester(manager);
}
