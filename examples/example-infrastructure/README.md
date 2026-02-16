# @c.a.f/example-infrastructure

Example infrastructure implementations for CAF. This package demonstrates how to create domain-specific infrastructure APIs using CAF framework packages.

## Overview

This package contains example implementations of domain-specific APIs:
- `LoginApi` - Example login API implementation
- `LogoutApi` - Example logout API implementation  
- `UserApi` - Example user API implementation

These APIs use:
- `@c.a.f/core` - Core primitives (RouteManager, UseCase, etc.)
- `@c.a.f/example-domain` - Example domain entities and use cases
- `@c.a.f/infrastructure-axios` - HTTP client implementation

## Installation

This package is part of the CAF monorepo and is not published. It's used internally by example applications.

## Usage

```typescript
import { LoginApi } from '@c.a.f/example-infrastructure';
import { useRouteManager } from '@c.a.f/infrastructure-react';
import { Login } from '@c.a.f/example-domain';

// In a React component
const routeManager = useRouteManager();
const loginApi = new LoginApi(routeManager);
const result = await loginApi.login(new Login('username', 'password'));
```

## Purpose

This package serves as an **example** of how to structure domain-specific infrastructure code. In a real application, you would:

1. Create your own domain package (similar to `@c.a.f/example-domain`)
2. Create your own infrastructure package (similar to this one)
3. Implement your domain-specific APIs using CAF framework packages

## Dependencies

- `@c.a.f/core` - Core framework primitives
- `@c.a.f/example-domain` - Example domain (for demonstration)
- `@c.a.f/infrastructure-axios` - HTTP client implementation
- `axios` - HTTP client library

## License

MIT
