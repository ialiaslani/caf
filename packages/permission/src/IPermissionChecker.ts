/**
 * Permission checking interfaces.
 * 
 * Provides framework-agnostic interfaces for checking user permissions.
 * Infrastructure or application layers should implement these interfaces.
 */

/**
 * Result of a permission check.
 */
export interface PermissionResult {
  /** Whether the permission is granted */
  granted: boolean;
  /** Optional reason if permission is denied */
  reason?: string;
}

/**
 * Permission checker interface.
 * 
 * Implement this interface in infrastructure or application layers to check
 * if a user has permission to perform an action or access a resource.
 * 
 * @example
 * ```ts
 * class RoleBasedPermissionChecker implements IPermissionChecker {
 *   constructor(private userRoles: string[]) {}
 *   
 *   async check(permission: string): Promise<PermissionResult> {
 *     const hasPermission = this.userRoles.includes(permission);
 *     return {
 *       granted: hasPermission,
 *       reason: hasPermission ? undefined : 'User does not have required role',
 *     };
 *   }
 * }
 * ```
 */
export interface IPermissionChecker {
  /**
   * Check if the current user has a specific permission.
   * @param permission Permission identifier (e.g., 'user.edit', 'admin.dashboard', 'post.delete')
   * @returns Promise resolving to permission result
   */
  check(permission: string): Promise<PermissionResult> | PermissionResult;
  
  /**
   * Check if the user has any of the specified permissions (OR logic).
   * @param permissions Array of permission identifiers
   * @returns Promise resolving to permission result
   */
  checkAny(permissions: string[]): Promise<PermissionResult> | PermissionResult;
  
  /**
   * Check if the user has all of the specified permissions (AND logic).
   * @param permissions Array of permission identifiers
   * @returns Promise resolving to permission result
   */
  checkAll(permissions: string[]): Promise<PermissionResult> | PermissionResult;
}
