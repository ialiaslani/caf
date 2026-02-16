import type { IPermissionChecker, PermissionResult } from './IPermissionChecker';

/**
 * Permission manager utility.
 * 
 * Provides helper methods for checking permissions using a permission checker.
 * Can be used in use cases, Plocs, or infrastructure layers.
 */
export class PermissionManager {
  constructor(private checker: IPermissionChecker) {}

  /**
   * Check if the user has a specific permission.
   */
  async hasPermission(permission: string): Promise<boolean> {
    const result = await this.checker.check(permission);
    return result.granted;
  }

  /**
   * Check if the user has any of the specified permissions (OR logic).
   */
  async hasAnyPermission(permissions: string[]): Promise<boolean> {
    const result = await this.checker.checkAny(permissions);
    return result.granted;
  }

  /**
   * Check if the user has all of the specified permissions (AND logic).
   */
  async hasAllPermissions(permissions: string[]): Promise<boolean> {
    const result = await this.checker.checkAll(permissions);
    return result.granted;
  }

  /**
   * Check permission and throw if denied.
   * @throws {PermissionDeniedError} If permission is denied
   */
  async requirePermission(permission: string): Promise<void> {
    const result = await this.checker.check(permission);
    if (!result.granted) {
      throw new PermissionDeniedError(permission, result.reason);
    }
  }

  /**
   * Check any permission and throw if all are denied.
   * @throws {PermissionDeniedError} If all permissions are denied
   */
  async requireAnyPermission(permissions: string[]): Promise<void> {
    const result = await this.checker.checkAny(permissions);
    if (!result.granted) {
      throw new PermissionDeniedError(
        permissions.join(' or '),
        result.reason || 'None of the required permissions are granted'
      );
    }
  }

  /**
   * Check all permissions and throw if any are denied.
   * @throws {PermissionDeniedError} If any permission is denied
   */
  async requireAllPermissions(permissions: string[]): Promise<void> {
    const result = await this.checker.checkAll(permissions);
    if (!result.granted) {
      throw new PermissionDeniedError(
        permissions.join(' and '),
        result.reason || 'Not all required permissions are granted'
      );
    }
  }

  /**
   * Get the underlying permission checker.
   */
  getChecker(): IPermissionChecker {
    return this.checker;
  }
}

/**
 * Exception thrown when a permission check fails.
 */
export class PermissionDeniedError extends Error {
  constructor(
    public readonly permission: string,
    public readonly reason?: string
  ) {
    super(
      reason
        ? `Permission denied: ${permission}. ${reason}`
        : `Permission denied: ${permission}`
    );
    this.name = 'PermissionDeniedError';
  }
}
