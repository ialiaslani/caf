# @c-a-f/permission

Framework-agnostic permission checking interfaces and adapters for CAF. Works with role-based, policy-based, or custom permission strategies.

## Installation

```bash
npm install @c-a-f/permission
```

## Usage

### Core Interfaces

The package provides framework-agnostic interfaces that work with any permission checking strategy:

```typescript
import { IPermissionChecker, PermissionResult, PermissionManager } from '@c-a-f/permission';

// IPermissionChecker interface can be implemented by any permission checking adapter
interface IPermissionChecker {
  check(permission: string): Promise<PermissionResult> | PermissionResult;
  checkAny(permissions: string[]): Promise<PermissionResult> | PermissionResult;
  checkAll(permissions: string[]): Promise<PermissionResult> | PermissionResult;
}
```

### Permission Manager

Use `PermissionManager` to provide convenient methods for checking permissions:

```typescript
import { PermissionManager, IPermissionChecker } from '@c-a-f/permission';

// Create a permission checker implementation
class MyPermissionChecker implements IPermissionChecker {
  check(permission: string): PermissionResult {
    // Your permission checking logic
    return { granted: true };
  }
  checkAny(permissions: string[]): PermissionResult {
    // Your logic
    return { granted: true };
  }
  checkAll(permissions: string[]): PermissionResult {
    // Your logic
    return { granted: true };
  }
}

// Use PermissionManager
const checker = new MyPermissionChecker();
const permissionManager = new PermissionManager(checker);

// Check permissions
const canEdit = await permissionManager.hasPermission('user.edit');
const canDelete = await permissionManager.hasAnyPermission(['user.delete', 'admin.delete']);
const canManage = await permissionManager.hasAllPermissions(['user.edit', 'user.delete']);

// Require permissions (throws if denied)
await permissionManager.requirePermission('user.delete');
```

## Integration with Role-Based Permissions

```typescript
import { RoleBasedPermissionChecker } from '@c-a-f/permission/role-based';
import { PermissionManager } from '@c-a-f/permission';

// Define role-to-permission mapping
const rolePermissions = {
  admin: ['user.create', 'user.edit', 'user.delete', 'admin.dashboard'],
  editor: ['user.edit', 'post.create', 'post.edit'],
  viewer: ['user.view', 'post.view'],
};

// Create checker with user roles
const checker = new RoleBasedPermissionChecker(['admin', 'editor'], rolePermissions);
const permissionManager = new PermissionManager(checker);

// Check permissions
const canEdit = await permissionManager.hasPermission('user.edit'); // true
const canDelete = await permissionManager.hasPermission('user.delete'); // true
const canView = await permissionManager.hasPermission('user.view'); // true

// Require permission (throws if denied)
await permissionManager.requirePermission('admin.dashboard');
```

## Integration with Policy-Based Permissions

```typescript
import { PolicyBasedPermissionChecker } from '@c-a-f/permission/policy-based';
import { PermissionManager } from '@c-a-f/permission';

// Define user context
interface UserContext {
  userId: string;
  roles: string[];
  targetUserId?: string;
}

// Define policies
const policies = {
  'user.edit': (context: UserContext) => {
    return context.userId === context.targetUserId || context.roles.includes('admin');
  },
  'post.delete': (context: UserContext & { authorId: string }) => {
    return context.authorId === context.userId || context.roles.includes('admin');
  },
  'admin.dashboard': (context: UserContext) => {
    return context.roles.includes('admin');
  },
};

// Create checker with user context
const context: UserContext = {
  userId: '123',
  roles: ['user'],
  targetUserId: '123',
};

const checker = new PolicyBasedPermissionChecker(policies, context);
const permissionManager = new PermissionManager(checker);

// Check permissions
const canEdit = await permissionManager.hasPermission('user.edit'); // true (same user)
const canDelete = await permissionManager.hasPermission('post.delete'); // false (different author)
```

## Integration with Simple Permissions

```typescript
import { SimplePermissionChecker } from '@c-a-f/permission/simple';
import { PermissionManager } from '@c-a-f/permission';

// Create checker with user permissions
const checker = new SimplePermissionChecker([
  'user.view',
  'user.edit',
  'post.create',
]);
const permissionManager = new PermissionManager(checker);

// Check permissions
const canEdit = await permissionManager.hasPermission('user.edit'); // true
const canDelete = await permissionManager.hasPermission('user.delete'); // false

// Require permission (throws if denied)
try {
  await permissionManager.requirePermission('user.delete');
} catch (error) {
  // PermissionDeniedError thrown
}
```

## Integration with CASL

```typescript
import { AbilityBuilder, Ability } from '@casl/ability';
import { CaslPermissionChecker } from '@c-a-f/permission/casl';
import { PermissionManager } from '@c-a-f/permission';

// Define abilities using CASL
const { can, cannot, build } = new AbilityBuilder(Ability);
can('read', 'Post');
can('delete', 'Post', { authorId: '123' });
can('manage', 'all'); // Admin can do everything

const ability = build();

// Create checker
const checker = new CaslPermissionChecker(ability);
const permissionManager = new PermissionManager(checker);

// Check permissions (CASL uses 'action:subject' format)
const canRead = await permissionManager.hasPermission('read:Post'); // true
const canDelete = await permissionManager.hasPermission('delete:Post'); // true (if authorId matches)
const canManage = await permissionManager.hasPermission('manage:all'); // true
```

## Integration with Resource-Based Permissions

```typescript
import { ResourceBasedPermissionChecker } from '@c-a-f/permission/resource-based';
import { PermissionManager } from '@c-a-f/permission';

// Define resource permissions
const resourcePermissions = {
  user: {
    create: ['admin'],
    read: ['admin', 'user', 'viewer'],
    update: ['admin', 'user'],
    delete: ['admin'],
  },
  post: {
    create: ['admin', 'editor'],
    read: ['admin', 'editor', 'viewer'],
    update: ['admin', 'editor'],
    delete: ['admin'],
  },
};

// Create checker with user roles
const checker = new ResourceBasedPermissionChecker(['admin', 'editor'], resourcePermissions);
const permissionManager = new PermissionManager(checker);

// Check permissions (format: 'action:resource')
const canCreate = await permissionManager.hasPermission('create:user'); // true
const canRead = await permissionManager.hasPermission('read:post'); // true
const canDelete = await permissionManager.hasPermission('delete:user'); // true
```

## Integration with Hierarchical Permissions

```typescript
import { HierarchicalPermissionChecker } from '@c-a-f/permission/hierarchical';
import { PermissionManager } from '@c-a-f/permission';

// Define hierarchical permissions (wildcards supported)
const userPermissions = [
  'admin.*',           // Grants all admin permissions
  'user.edit.*',       // Grants all user.edit permissions
  'post.create',       // Specific permission
];

// Create checker
const checker = new HierarchicalPermissionChecker(userPermissions);
const permissionManager = new PermissionManager(checker);

// Check permissions
const canAdmin = await permissionManager.hasPermission('admin.dashboard'); // true (inherited from admin.*)
const canEditUser = await permissionManager.hasPermission('user.edit.name'); // true (inherited from user.edit.*)
const canCreatePost = await permissionManager.hasPermission('post.create'); // true (exact match)
const canDeletePost = await permissionManager.hasPermission('post.delete'); // false
```

## Integration with Time-Based Permissions

```typescript
import { TimeBasedPermissionChecker } from '@c-a-f/permission/time-based';
import { SimplePermissionChecker } from '@c-a-f/permission/simple';
import { PermissionManager } from '@c-a-f/permission';

// Define time-based permissions
const timePermissions = {
  'user.edit': {
    allowed: true,
    startTime: new Date('2024-01-01'),
    endTime: new Date('2024-12-31'),
    allowedDays: [1, 2, 3, 4, 5], // Monday to Friday
    allowedHours: { start: 9, end: 17 }, // 9 AM to 5 PM
  },
  'admin.dashboard': {
    allowed: true,
    // No time restrictions
  },
};

// Create base checker
const baseChecker = new SimplePermissionChecker(['user.edit', 'admin.dashboard']);

// Wrap with time-based checker
const checker = new TimeBasedPermissionChecker(baseChecker, timePermissions);
const permissionManager = new PermissionManager(checker);

// Check permissions (will check time constraints)
const canEdit = await permissionManager.hasPermission('user.edit'); // true if within time constraints
const canAdmin = await permissionManager.hasPermission('admin.dashboard'); // always true
```

## Custom Permission Checker Implementation

You can implement `IPermissionChecker` for any permission checking strategy:

```typescript
import { IPermissionChecker, PermissionResult, PermissionManager } from '@c-a-f/permission';

class CustomPermissionChecker implements IPermissionChecker {
  constructor(private userPermissions: string[]) {}

  check(permission: string): PermissionResult {
    const granted = this.userPermissions.includes(permission);
    return {
      granted,
      reason: granted ? undefined : `Permission '${permission}' not granted`,
    };
  }

  checkAny(permissions: string[]): PermissionResult {
    const granted = permissions.some(p => this.userPermissions.includes(p));
    return {
      granted,
      reason: granted ? undefined : 'None of the permissions are granted',
    };
  }

  checkAll(permissions: string[]): PermissionResult {
    const missing = permissions.filter(p => !this.userPermissions.includes(p));
    return {
      granted: missing.length === 0,
      reason: missing.length > 0 ? `Missing permissions: ${missing.join(', ')}` : undefined,
    };
  }
}

// Use with PermissionManager
const checker = new CustomPermissionChecker(['user.edit', 'post.create']);
const permissionManager = new PermissionManager(checker);
const canEdit = await permissionManager.hasPermission('user.edit');
```

## Usage in Use Cases and Plocs

```typescript
import { UseCase, RequestResult, pulse } from '@c-a-f/core';
import { PermissionManager, IPermissionChecker } from '@c-a-f/permission';

class DeleteUser implements UseCase<[{ userId: string }], void> {
  constructor(
    private userService: UserService,
    private permissionManager: PermissionManager
  ) {}

  async execute(args: { userId: string }): Promise<RequestResult<void>> {
    // Check permission before proceeding
    await this.permissionManager.requirePermission('user.delete');

    try {
      await this.userService.deleteUser(args.userId);
      return {
        loading: pulse(false),
        data: pulse(undefined!),
        error: pulse(null! as Error),
      };
    } catch (error) {
      return {
        loading: pulse(false),
        data: pulse(undefined!),
        error: pulse(error as Error),
      };
    }
  }
}
```

## Exports

- `IPermissionChecker` — Interface for permission checking implementations
- `PermissionResult` — Result type with granted status and optional reason
- `PermissionManager` — Utility class for checking permissions
- `PermissionDeniedError` — Exception thrown when permission is denied
- `RoleBasedPermissionChecker` — Adapter for role-based permissions (from `@c-a-f/permission/role-based`)
- `PolicyBasedPermissionChecker` — Adapter for policy-based permissions (from `@c-a-f/permission/policy-based`)
- `SimplePermissionChecker` — Adapter for simple permission lists (from `@c-a-f/permission/simple`)
- `CaslPermissionChecker` — Adapter for CASL abilities (from `@c-a-f/permission/casl`)
- `ResourceBasedPermissionChecker` — Adapter for resource-based permissions (from `@c-a-f/permission/resource-based`)
- `HierarchicalPermissionChecker` — Adapter for hierarchical permissions with wildcards (from `@c-a-f/permission/hierarchical`)
- `TimeBasedPermissionChecker` — Adapter for time-based permission constraints (from `@c-a-f/permission/time-based`)

## Dependencies

- `@c-a-f/core` — Core primitives

## Peer Dependencies (Optional)

- `@casl/ability` — For CASL integration

## License

MIT
