---
title: "@c-a-f/permission"
sidebar_label: Permission
---

# @c-a-f/permission

Framework-agnostic permission checking interfaces and adapters for CAF. Works with role-based, policy-based, CASL, resource-based, hierarchical, time-based, or custom strategies.

## Installation

```bash
npm install @c-a-f/permission
```

For CASL integration (optional):

```bash
npm install @c-a-f/permission @casl/ability
```

## Features

| Feature | Description |
|--------|-------------|
| **IPermissionChecker** | Interface for any permission adapter: `check(permission)`, `checkAny(permissions)`, `checkAll(permissions)`. |
| **PermissionManager** | Convenience API: `hasPermission`, `hasAnyPermission`, `hasAllPermissions`, `requirePermission` (throws if denied). |
| **RoleBasedPermissionChecker** | Map roles to permissions; check by user roles. (`@c-a-f/permission/role-based`) |
| **PolicyBasedPermissionChecker** | Policy functions per permission with user context. (`@c-a-f/permission/policy-based`) |
| **SimplePermissionChecker** | Flat list of permission strings. (`@c-a-f/permission/simple`) |
| **CaslPermissionChecker** | Use CASL Ability for action/subject permissions. (`@c-a-f/permission/casl`) |
| **ResourceBasedPermissionChecker** | Map resource + action to roles. (`@c-a-f/permission/resource-based`) |
| **HierarchicalPermissionChecker** | Wildcards (e.g. `admin.*`, `user.edit.*`). (`@c-a-f/permission/hierarchical`) |
| **TimeBasedPermissionChecker** | Time windows, allowed days/hours. (`@c-a-f/permission/time-based`) |

## Core interfaces

```typescript
import { IPermissionChecker, PermissionResult, PermissionManager } from '@c-a-f/permission';

// IPermissionChecker: check, checkAny, checkAll
const permissionManager = new PermissionManager(myChecker);

const canEdit = await permissionManager.hasPermission('user.edit');
const canAny = await permissionManager.hasAnyPermission(['user.delete', 'admin.delete']);
const canAll = await permissionManager.hasAllPermissions(['user.edit', 'user.delete']);

await permissionManager.requirePermission('user.delete'); // throws if denied
```

## Role-based permissions

```typescript
import { RoleBasedPermissionChecker } from '@c-a-f/permission/role-based';
import { PermissionManager } from '@c-a-f/permission';

const rolePermissions = {
  admin: ['user.create', 'user.edit', 'user.delete', 'admin.dashboard'],
  editor: ['user.edit', 'post.create', 'post.edit'],
  viewer: ['user.view', 'post.view'],
};

const checker = new RoleBasedPermissionChecker(['admin', 'editor'], rolePermissions);
const permissionManager = new PermissionManager(checker);
const canEdit = await permissionManager.hasPermission('user.edit'); // true
```

## Policy-based permissions

```typescript
import { PolicyBasedPermissionChecker } from '@c-a-f/permission/policy-based';

const policies = {
  'user.edit': (context) => context.userId === context.targetUserId || context.roles.includes('admin'),
  'admin.dashboard': (context) => context.roles.includes('admin'),
};

const checker = new PolicyBasedPermissionChecker(policies, { userId: '123', roles: ['user'], targetUserId: '123' });
const permissionManager = new PermissionManager(checker);
```

## Simple permissions

```typescript
import { SimplePermissionChecker } from '@c-a-f/permission/simple';

const checker = new SimplePermissionChecker(['user.view', 'user.edit', 'post.create']);
const permissionManager = new PermissionManager(checker);
```

## CASL integration

```typescript
import { AbilityBuilder, Ability } from '@casl/ability';
import { CaslPermissionChecker } from '@c-a-f/permission/casl';

const { can, build } = new AbilityBuilder(Ability);
can('read', 'Post');
can('delete', 'Post', { authorId: '123' });
const ability = build();

const checker = new CaslPermissionChecker(ability);
const permissionManager = new PermissionManager(checker);
const canRead = await permissionManager.hasPermission('read:Post');
```

## Resource-based permissions

```typescript
import { ResourceBasedPermissionChecker } from '@c-a-f/permission/resource-based';

const resourcePermissions = {
  user: { create: ['admin'], read: ['admin', 'user'], update: ['admin', 'user'], delete: ['admin'] },
  post: { create: ['admin', 'editor'], read: ['admin', 'editor', 'viewer'], update: ['admin', 'editor'], delete: ['admin'] },
};

const checker = new ResourceBasedPermissionChecker(['admin', 'editor'], resourcePermissions);
const permissionManager = new PermissionManager(checker);
const canCreate = await permissionManager.hasPermission('create:user');
```

## Hierarchical permissions

```typescript
import { HierarchicalPermissionChecker } from '@c-a-f/permission/hierarchical';

const userPermissions = ['admin.*', 'user.edit.*', 'post.create'];
const checker = new HierarchicalPermissionChecker(userPermissions);
const permissionManager = new PermissionManager(checker);
const canAdmin = await permissionManager.hasPermission('admin.dashboard'); // true (admin.*)
```

## Time-based permissions

```typescript
import { TimeBasedPermissionChecker } from '@c-a-f/permission/time-based';
import { SimplePermissionChecker } from '@c-a-f/permission/simple';

const timePermissions = {
  'user.edit': {
    allowed: true,
    startTime: new Date('2024-01-01'),
    endTime: new Date('2024-12-31'),
    allowedDays: [1, 2, 3, 4, 5],
    allowedHours: { start: 9, end: 17 },
  },
};

const baseChecker = new SimplePermissionChecker(['user.edit']);
const checker = new TimeBasedPermissionChecker(baseChecker, timePermissions);
const permissionManager = new PermissionManager(checker);
```

## Custom checker

Implement `IPermissionChecker` with your own logic and use it with `PermissionManager`.

## Exports

- **Main:** `IPermissionChecker`, `PermissionResult`, `PermissionManager`, `PermissionDeniedError`
- **Subpaths:** `/role-based`, `/policy-based`, `/simple`, `/casl`, `/resource-based`, `/hierarchical`, `/time-based`

## Dependencies

- `@c-a-f/core` — Core primitives  
- Optional peer: `@casl/ability` for CASL adapter
